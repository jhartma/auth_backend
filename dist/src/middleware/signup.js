"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isEmail = require("isemail");
const uuid = require("uuid");
const db_1 = require("../db");
const createValidatedUserMessage_1 = require("../lib/emails/createValidatedUserMessage");
const createValidationToken_1 = require("../lib/helpers/createValidationToken");
const hashString_1 = require("../lib/helpers/hashString");
const sendMail_1 = require("../lib/helpers/sendMail");
const regex_1 = require("../lib/regex/regex");
const config_1 = require("../server/config");
const logger_1 = require("../server/logger");
const messages_1 = require("../server/messages");
async function signup({ body: { username, email, password } }, res) {
    if (!username || username.length < 6) {
        res.json({ status: 505, message: messages_1.MESSAGE_FAILURE_USERNAME_TOO_SHORT });
        return;
    }
    if (!password) {
        res.json({ status: 505, message: messages_1.MESSAGE_FAILURE_PASSWD_TOO_SHORT });
        return;
    }
    const uname = username.toLowerCase();
    const pw = password;
    const mail = email.toLowerCase();
    const checkUsername = await db_1.Accounts.findOne({ $and: [
            { deleted: false },
            { username: uname },
        ] }, (err) => {
        if (err) {
            logger_1.default.log("error", `[ createUser ] An error occurred when looking for account for username: ${uname}. Err: ${err}`);
            res.json({ status: 500, message: messages_1.MESSAGE_FAILURE_UNDEFINED, data: { error: err } });
            return;
        }
    });
    const checkEmail = await db_1.Accounts.findOne({ emails: { $elemMatch: { address: mail } } }, (err) => {
        if (err) {
            logger_1.default.log("error", `[ createUser ] An error occurred when looking for account for email: ${mail}. Err: ${err}`);
            res.json({ status: 500, message: messages_1.MESSAGE_FAILURE_UNDEFINED, data: { error: err } });
            return;
        }
    });
    if (checkUsername) {
        logger_1.default.log("info", `[ createUser ] Account for username ${uname} already exists`);
        res.json({ status: 503, message: messages_1.MESSAGE_FAILURE_USER_EXISTS });
        return;
    }
    if (checkEmail) {
        logger_1.default.log("info", `[ createUser ] Account for email ${mail} already exists`);
        res.json({ status: 504, message: messages_1.MESSAGE_FAILURE_EMAIL_EXISTS });
        return;
    }
    if (pw.length < 6) {
        logger_1.default.log("info", `[ createUser ] Password is too short: ${pw}`);
        res.json({ status: 505, message: messages_1.MESSAGE_FAILURE_PASSWD_TOO_SHORT });
        return;
    }
    if (!regex_1.passwordRegex.test(pw)) {
        logger_1.default.log("info", `[ createUser ] Invalid password: ${pw}`);
        res.json({ status: 506, message: messages_1.MESSAGE_FAILURE_PASSWD_INSECURE });
        return;
    }
    if (!isEmail.validate(mail, { checkDNS: false })) {
        logger_1.default.log("info", `[ createUser ] Invalid email: ${mail}`);
        res.json({ status: 510, message: messages_1.MESSAGE_FAILURE_EMAIL_INVALID });
        return;
    }
    const encryptedPassword = await hashString_1.hashString(pw).catch((err) => {
        logger_1.default.log("error", `[ createUser ] Could't generate password: ${err}`);
        res.json({ status: 500, message: messages_1.MESSAGE_FAILURE_UNDEFINED, data: { error: err } });
        return null;
    });
    const validationToken = await createValidationToken_1.createValidationToken().catch((err) => {
        logger_1.default.log("error", `[ createUser ] Could't generate validation token: ${err}`);
        res.json({ status: 500, message: messages_1.MESSAGE_FAILURE_UNDEFINED, data: { error: err } });
        return null;
    });
    const hashedToken = await hashString_1.hashString(validationToken);
    const user = {
        _id: uuid.v4(),
        emails: [{ address: mail, verified: false }],
        services: {
            password: {
                hash: encryptedPassword,
                resetPasswordDate: Date.now(),
                resetPasswordExpires: Date.now() + (60 * 60 * 10000),
                resetPasswordToken: hashedToken,
            },
        },
        username,
    };
    const createdUser = await db_1.Accounts.create(user, (err) => {
        if (err) {
            logger_1.default.log("error", `[ createUser ] Could't create user: ${err}`);
            res.json({ status: 502, message: messages_1.MESSAGE_FAILURE_SAVE_USER, data: { error: err } });
            return null;
        }
    });
    if (createdUser) {
        const subject = `Confirm ${config_1.APP_NAME} password`;
        const message = createValidatedUserMessage_1.createValidatedUserMessage(config_1.APP_URL, config_1.APP_NAME, validationToken, email);
        const sent = await sendMail_1.sendMail(user.emails[0].address, subject, message, { SMTP_PASSWORD: config_1.SMTP_PASSWORD, SMTP_USER: config_1.SMTP_USER, SMTP_SERVER: config_1.SMTP_SERVER, SMTP_PORT: config_1.SMTP_PORT, EMAIL_ADDRESS: config_1.EMAIL_ADDRESS })
            .catch((err) => {
            logger_1.default.log("error", `[ createUser ] Could't send email: ${err}`);
            res.json({ status: 507, message: messages_1.MESSAGE_FAILURE_SEND_MAIL, data: { error: err } });
        });
        if (sent === "done") {
            res.json({ status: 200, message: messages_1.MESSAGE_ACCOUNT_CREATED, data: { username: uname, userId: user._id, validationToken } });
            return;
        }
    }
}
exports.signup = signup;
//# sourceMappingURL=signup.js.map