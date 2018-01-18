"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const forgotPasswordMessage_1 = require("../lib/emails/forgotPasswordMessage");
const createValidationToken_1 = require("../lib/helpers/createValidationToken");
const hashString_1 = require("../lib/helpers/hashString");
const sendMail_1 = require("../lib/helpers/sendMail");
const config_1 = require("../server/config");
const logger_1 = require("../server/logger");
const messages_1 = require("../server/messages");
async function forgotPassword({ body: { email } }, res) {
    let errorMessage;
    const token = await createValidationToken_1.createValidationToken().catch((error) => {
        logger_1.default.log("error", "[ forgotPassword ] Error while creating validation token", { userId: null, function: "createValidationToken", stacktrace: error });
        errorMessage = messages_1.MESSAGE_FAILURE_VALIDATION_TOKEN;
        res.json({ status: 508, message: messages_1.MESSAGE_FAILURE_VALIDATION_TOKEN, data: { error } });
        return null;
    });
    const tokenHash = await hashString_1.hashString(token);
    const user = await db_1.Accounts.findOne({ $and: [
            { deleted: false },
            { "emails.0.address": email },
        ] }, (err, res2) => {
        if (err) {
            logger_1.default.log("error", "[ forgotPassword ] Couldn't write user to db", { userId: null, function: "writeUserToDb", stacktrace: err });
            errorMessage = messages_1.MESSAGE_FAILURE_FIND_USER;
            res.json({ status: 509, message: messages_1.MESSAGE_FAILURE_FIND_USER, data: { err } });
            return null;
        }
        if (!res2) {
            errorMessage = messages_1.MESSAGE_FAILURE_FIND_USER;
            res.json({ status: 509, message: messages_1.MESSAGE_FAILURE_FIND_USER });
            return null;
        }
        res2.services.password.resetPasswordToken = tokenHash;
        res2.services.password.resetPasswordExpires = Date.now() + (60 * 60 * 10000);
        res2.save((err2) => {
            if (!err2) {
                return res2;
            }
        });
    });
    if (!user) {
        return null;
    }
    const subject = `Reset your ${config_1.APP_NAME} password`;
    const message = forgotPasswordMessage_1.forgotPasswordMessage(config_1.APP_URL, config_1.APP_NAME, token, email);
    const res3 = await sendMail_1.sendMail(user.emails[0].address, subject, message, { SMTP_PASSWORD: config_1.SMTP_PASSWORD, SMTP_USER: config_1.SMTP_USER, SMTP_SERVER: config_1.SMTP_SERVER, SMTP_PORT: config_1.SMTP_PORT, EMAIL_ADDRESS: config_1.EMAIL_ADDRESS })
        .catch((error) => {
        logger_1.default.log("error", "[ forgotPassword ] Couldn't send email", { userId: null, function: "sendMail", stacktrace: error });
        errorMessage = messages_1.MESSAGE_FAILURE_SEND_MAIL;
        res.json({ status: 507, message: messages_1.MESSAGE_FAILURE_SEND_MAIL, data: { error } });
        return null;
    });
    if (process.env.NODE_ENV !== "production") {
        res.json({ data: { error: errorMessage, token }, status: 200, message: messages_1.MESSAGE_SUCCESS_RESEND_PASSWD });
    }
    else {
        res.json({ data: { error: errorMessage }, status: 200, message: messages_1.MESSAGE_SUCCESS_RESEND_PASSWD });
    }
}
exports.forgotPassword = forgotPassword;
//# sourceMappingURL=forgotPassword.js.map