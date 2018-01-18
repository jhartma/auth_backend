"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
const logger_1 = require("../../server/logger");
function sendMail(email, subject, text, env) {
    return new Promise((resolve, reject) => {
        const { SMTP_PASSWORD, SMTP_USER, SMTP_SERVER, SMTP_PORT, EMAIL_ADDRESS } = env;
        const smtpTransport = nodemailer.createTransport({
            auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
            host: SMTP_SERVER,
            port: SMTP_PORT,
            secure: true,
        });
        const mailOptions = {
            from: EMAIL_ADDRESS,
            subject,
            text,
            to: email,
        };
        smtpTransport.sendMail(mailOptions, (err) => {
            if (err) {
                logger_1.default.log("error", `[ sendMail ] An error occured sending an email to ${email}, ${err}`);
                reject(err);
            }
            else {
                logger_1.default.log("info", `[ sendMail ] An email was sent to ${email}`);
                resolve("done");
            }
        });
    });
}
exports.sendMail = sendMail;
//# sourceMappingURL=sendMail.js.map