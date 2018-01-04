"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const login_1 = require("../lib/login");
const logger_1 = require("../server/logger");
const messages_1 = require("../server/messages");
const securePassword = require('secure-password');
async function confirmAccount(req, res, next) {
    const { params: { token, email } } = req;
    const user = await db_1.Accounts.findOne({
        $and: [
            { deleted: false },
            { emails: { $elemMatch: { address: email } } },
            { "services.password.resetPasswordExpires": { $gte: new Date() } },
        ],
    }, (err, res2) => {
        if (err) {
            logger_1.default.log("error", `[ confirmAccount ] Error finding user for token ${token}: ${err}`);
            res2.json({ status: 501, message: messages_1.MESSAGE_FAILURE_INVALID_TOKEN, data: { error: err } });
            return null;
        }
    });
    if (!user) {
        logger_1.default.log("info", `Couldnt find user for token: ${token}`);
        res.json({ status: 501, message: messages_1.MESSAGE_FAILURE_INVALID_TOKEN });
        return;
    }
    const pwd = securePassword();
    const bufferedToken = Buffer.from(token);
    const tokenVerificationResult = pwd.verifySync(bufferedToken, user.services.password.resetPasswordToken);
    if (tokenVerificationResult !== securePassword.VALID) {
        res.json({ status: 501, message: messages_1.MESSAGE_FAILURE_INVALID_TOKEN });
        return null;
    }
    user.services.password.resetPasswordToken = null;
    user.services.password.resetPasswordExpires = null;
    user.services.password.validated = true;
    user.save((err) => {
        if (err) {
            logger_1.default.log("error", `[ confirmAccount ] Error creating user for token ${token}: ${err}`);
            res.json({ status: 502, message: messages_1.MESSAGE_FAILURE_SAVE_USER, data: { error: err } });
            return;
        }
        const cb = () => res.json({ status: 200, message: messages_1.MESSAGE_ACCOUNT_CONFIRMED_SUCCESS, data: { username: user.username, userId: user._id } });
        login_1.login(user, req, res, next, cb);
    });
}
exports.confirmAccount = confirmAccount;
//# sourceMappingURL=confirmAccount.js.map