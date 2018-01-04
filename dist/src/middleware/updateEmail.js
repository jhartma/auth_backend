"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isEmail = require("isemail");
const db_1 = require("../db");
const logger_1 = require("../server/logger");
const messages_1 = require("../server/messages");
async function updateEmail(req, res, next) {
    const userId = req.session.passport.user._id;
    const email = req.query.email;
    const sessionId = req.session.id;
    const checkEmail = await db_1.Accounts.findOne({ $and: [
            { deleted: false },
            { emails: { $elemMatch: { address: email } } },
        ] }, (err) => {
        if (err) {
            logger_1.default.log("error", `[ checkEmail ] An error occurred when looking for account for email: ${email}. Err: ${err}`);
            res.json({ status: 500, message: messages_1.MESSAGE_FAILURE_UNDEFINED, data: { error: err } });
        }
    });
    if (checkEmail) {
        logger_1.default.log("info", `Account for email ${email} already exists`);
        res.json({ status: 504, message: messages_1.MESSAGE_FAILURE_EMAIL_EXISTS });
        return;
    }
    if (!isEmail.validate(email, { checkDNS: false })) {
        logger_1.default.log("info", `Invalid email: ${email}`);
        res.json({ status: 510, message: messages_1.MESSAGE_FAILURE_EMAIL_INVALID });
        return;
    }
    await db_1.Accounts.update({ _id: userId }, { $set: { "emails.0.address": email } }, (err) => {
        if (err) {
            res.json({ status: 512, message: messages_1.MESSAGE_FAILURE_UPDATE_USER, data: { error: err } });
        }
    });
    logger_1.default.log("info", `[ updateEmail ] user ${userId} updated his/her email address to ${email}`);
    const user = await db_1.Accounts.findOne({ _id: userId }).lean().exec((res2) => res2);
    await db_1.Sessions.update({ _id: sessionId }, { $set: { "session.passport.user.email": email } });
    res.json({ status: 200, message: messages_1.MESSAGE_SUCCESS_UPDATE_USER, data: { user } });
}
exports.updateEmail = updateEmail;
//# sourceMappingURL=updateEmail.js.map