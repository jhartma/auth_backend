"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const hashString_1 = require("../lib/helpers/hashString");
const regex_1 = require("../lib/regex/regex");
const logger_1 = require("../server/logger");
const messages_1 = require("../server/messages");
const securePassword = require('secure-password');
async function resetPassword({ body: { token, password, email } }, res) {
    let errorMessage;
    if (!regex_1.passwordRegex.test(password)) {
        logger_1.default.log("info", `Invalid password: ${password}`);
        res.json({ status: 506, message: messages_1.MESSAGE_FAILURE_PASSWD_INSECURE });
        return;
    }
    const generatedPassword = await hashString_1.hashString(password).catch((error) => {
        logger_1.default.log("error", "Error while generating password", { userId: null, function: "hashString", stacktrace: error });
        errorMessage = "Error: Couldn't generate password!";
        res.json({ status: 500, message: messages_1.MESSAGE_FAILURE_UNDEFINED });
        return null;
    });
    const hash = await hashString_1.hashString(token);
    const user = await db_1.Accounts.findOne({
        $and: [
            { deleted: false },
            { emails: { $elemMatch: { address: email } } },
            { "services.password.resetPasswordExpires": { $gte: new Date() } },
        ],
    }, (err2, user2) => {
        if (err2) {
            errorMessage = "Error: Couldn't find user!";
            res.json({ status: 509, message: messages_1.MESSAGE_FAILURE_FIND_USER, data: { error: err2 } });
            return null;
        }
    });
    if (user) {
        const pwd = securePassword();
        const userPassword = Buffer.from(token);
        const tokenVerificationResult = pwd.verifySync(userPassword, user.services.password.resetPasswordToken);
        if (tokenVerificationResult !== securePassword.VALID) {
            res.json({ status: 501, message: messages_1.MESSAGE_FAILURE_INVALID_TOKEN });
            return null;
        }
        user.services.password.hash = generatedPassword;
        user.services.password.resetPasswordToken = "";
        user.services.password.resetPasswordExpires = null;
        user.save((err3) => {
            if (err3) {
                errorMessage = "Error: Couldn't update the password!";
                res.json({ status: 511, message: messages_1.MESSAGE_FAILURE_SAVE_PASSWD, data: { error: err3 } });
                return null;
            }
            res.json({ status: 200, message: messages_1.MESSAGE_SUCCESS_RESET_PASSWD, data: { user } });
            return null;
        });
    }
    else {
        errorMessage = "Error: The link is either invalid or has expired. Please resend your email address!";
        res.json({ status: 501, message: messages_1.MESSAGE_FAILURE_INVALID_TOKEN });
        return null;
    }
}
exports.resetPassword = resetPassword;
//# sourceMappingURL=resetPassword.js.map