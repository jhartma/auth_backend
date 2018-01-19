"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const db_1 = require("../db");
const logger_1 = require("../server/logger");
const messages_1 = require("../server/messages");
async function updateUsername(req, res, next) {
    const test = process.env.NODE_ENV === "test";
    const userId = test ? ramda_1.pathOr(null, ["query", "userId"], req) : ramda_1.pathOr(null, ["session", "passport", "user", "_id"], req);
    const username = ramda_1.pathOr(null, ["query", "username"], req);
    const sessionId = ramda_1.pathOr(null, ["session", "id"], req);
    if (!userId || !username || !sessionId) {
        logger_1.default.log("error", `[ updateUsername ] An error occurred: ${username}. Err: Wrong session credentials`);
        res.json({ status: 500, message: messages_1.MESSAGE_FAILURE_UNDEFINED, data: { error: "Wrong session credentials" } });
        return;
    }
    const usernameExists = await db_1.Accounts.findOne({ $and: [
            { deleted: false },
            { username },
        ] }, (err) => {
        if (err) {
            logger_1.default.log("error", `[ updateUsername ] An error occurred when looking for account for username: ${username}. Err: ${err}`);
            res.json({ status: 500, message: messages_1.MESSAGE_FAILURE_UNDEFINED, data: { error: err } });
            return;
        }
    });
    if (usernameExists) {
        logger_1.default.log("info", `[ updateUsername ] Account for username ${username} already exists`);
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
        ] });
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