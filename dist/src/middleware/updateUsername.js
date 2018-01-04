"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const logger_1 = require("../server/logger");
const messages_1 = require("../server/messages");
async function updateUsername(req, res, next) {
    const userId = req.session.passport.user._id;
    const username = req.query.username;
    const sessionId = req.session.id;
    const usernameExists = await db_1.Accounts.findOne({ $and: [
            { deleted: false },
            { username },
        ] }, (err) => {
        if (err) {
            logger_1.default.log("error", `[ usernameExists ] An error occurred when looking for account for username: ${username}. Err: ${err}`);
            res.json({ status: 500, message: messages_1.MESSAGE_FAILURE_UNDEFINED, data: { error: err } });
            return;
        }
    });
    if (usernameExists) {
        logger_1.default.log("info", `Account for username ${username} already exists`);
        res.json({ status: 503, message: messages_1.MESSAGE_FAILURE_USER_EXISTS });
        return;
    }
    await db_1.Accounts.update({ $and: [
            { deleted: false },
            { _id: userId },
        ] }, {
        $set: { username },
    }, (err) => { if (err) {
        throw new Error(err);
    } });
    logger_1.default.log("info", `[ updateUsername ] user ${userId} updated his/her username to ${username}`);
    const user = await db_1.Accounts.findOne({ $and: [
            { deleted: false },
            { _id: userId },
        ] }).lean().exec((res2) => res2);
    await db_1.Sessions.update({ _id: sessionId }, { $set: { "session.passport.user.username": username } }, (err) => {
        if (err) {
            res.json({ status: 512, message: messages_1.MESSAGE_FAILURE_UPDATE_USER, data: { error: err } });
            return;
        }
    });
    return res.json({ status: 200, message: messages_1.MESSAGE_SUCCESS_UPDATE_USER, data: { user } });
}
exports.updateUsername = updateUsername;
//# sourceMappingURL=updateUsername.js.map