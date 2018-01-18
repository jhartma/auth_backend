"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const isEmail = require("isemail");
const db_1 = require("../db");
const logger_1 = require("../server/logger");
const messages_1 = require("../server/messages");
async function updateEmail(req, res, next) {
    const dev = process.env.NODE_ENV !== "production";
    const userId = dev ? ramda_1.pathOr(null, ["query", "userId"], req) : ramda_1.pathOr(null, ["session", "passport", "user", "_id"], req);
    const email = ramda_1.pathOr(null, ["query", "email"], req);
    const sessionId = ramda_1.pathOr(null, ["session", "id"], req);
    if (!userId || !email || !sessionId) {
        logger_1.default.log("error", `[ updateEmail ] An error occurred: ${email}. Err: Wrong session credentials`);
        res.json({ status: 500, message: messages_1.MESSAGE_FAILURE_UNDEFINED, data: { error: "Wrong session credentials" } });
        return;
    }
    const checkEmail = await db_1.Accounts.findOne({ $and: [
            { deleted: false },
            { emails: { $elemMatch: { address: email } } },
        ] }, (err) => {
        if (err) {
            logger_1.default.log("error", `[ updateEmail ] An error occurred when looking for account for email: ${email}. Err: ${err}`);
            res.json({ status: 500, message: messages_1.MESSAGE_FAILURE_UNDEFINED, data: { error: err } });
        }
    });
    if (checkEmail) {
        logger_1.default.log("info", `[ updateEmail ] Account for email ${email} already exists`);
        res.json({ status: 504, message: messages_1.MESSAGE_FAILURE_EMAIL_EXISTS });
        return;
    }
    if (!isEmail.validate(email, { checkDNS: false })) {
        logger_1.default.log("info", `[ updateEmail ] Invalid email: ${email}`);
        res.json({ status: 510, message: messages_1.MESSAGE_FAILURE_EMAIL_INVALID });
        return;
    }
    const account = await db_1.Accounts.findOne({ _id: userId });
    const existingMail = account.emails && account.emails[0] && account.emails[0].address;
    if (existingMail) {
        await db_1.Accounts.update({ _id: userId }, { $set: { "emails.0.address": email } }, (err) => {
            if (err) {
                res.json({ status: 512, message: messages_1.MESSAGE_FAILURE_UPDATE_USER, data: { error: err } });
                return;
            }
        });
    }
    else {
        await db_1.Accounts.update({ _id: userId }, { $set: { emails: [{ address: email }] } }, (err) => {
            if (err) {
                res.json({ status: 512, message: messages_1.MESSAGE_FAILURE_UPDATE_USER, data: { error: err } });
                return;
            }
        });
    }
    logger_1.default.log("info", `[ updateEmail ] user ${userId} updated his/her email address to ${email}`);
    const user = await db_1.Accounts.findOne({ _id: userId });
    await db_1.Sessions.update({ _id: sessionId }, { $set: { "session.passport.user.email": email } });
    res.json({ status: 200, message: messages_1.MESSAGE_SUCCESS_UPDATE_USER, data: { user } });
}
exports.updateEmail = updateEmail;
//# sourceMappingURL=updateEmail.js.map