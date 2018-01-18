"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const db_1 = require("../db");
const logger_1 = require("../server/logger");
const messages_1 = require("../server/messages");
async function removeUser(req, res, next) {
    const dev = process.env.NODE_ENV !== "production";
    const userId = dev ? ramda_1.pathOr(null, ["query", "userId"], req) : ramda_1.pathOr(null, ["session", "passport", "user", "_id"], req);
    const sessionId = ramda_1.pathOr(undefined, ["session", "id"], req);
    if (!userId || !sessionId) {
        logger_1.default.log("info", "[ removeUser ] Unauthorized attempt to delete user");
        res.json({ status: 509, message: messages_1.MESSAGE_FAILURE_FIND_USER });
        return;
    }
    const user = await db_1.Accounts.findOne({ $and: [
            { deleted: false },
            { _id: userId },
        ] }, (err) => {
        if (err) {
            logger_1.default.log("error", `[ removeUser ] An error occurred when looking for account for username: ${userId}. Err: ${err}`);
            res.json({ status: 500, message: messages_1.MESSAGE_FAILURE_UNDEFINED, data: { error: err } });
            return;
        }
    });
    if (!user) {
        logger_1.default.log("error", `[ removeUser ] An error occurred when looking for account for username: ${userId}.}`);
        res.json({ status: 515, message: messages_1.MESSAGE_FAILURE_NO_USER });
        return;
    }
    await db_1.Accounts.update({ _id: userId }, { $set: { deleted: true, deletedAt: (new Date().toISOString()) } }, (err) => {
        if (err) {
            res.json({ status: 516, message: messages_1.MESSAGE_FAILURE_REMOVE_USER, data: { error: err } });
            return;
        }
    });
    await db_1.Sessions.remove({ _id: sessionId }, (err) => {
        if (err) {
            res.json({ status: 516, message: messages_1.MESSAGE_FAILURE_REMOVE_USER, data: { error: err } });
            return;
        }
    });
    logger_1.default.log("info", `[ removeUser ] user ${userId} was removed`);
    return res.json({ status: 517, message: messages_1.MESSAGE_SUCCESS_REMOVE_USER, data: { user } });
}
exports.removeUser = removeUser;
//# sourceMappingURL=removeUser.js.map