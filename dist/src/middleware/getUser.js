"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const db_1 = require("../db");
const logger_1 = require("../server/logger");
const messages_1 = require("../server/messages");
async function getUser(req, res) {
    const sessionUser = ramda_1.pathOr(undefined, ["session", "passport", "user"], req);
    const userId = sessionUser || req.params.userId;
    const user = await db_1.Accounts.findOne({
        $and: [
            { _id: userId },
            { deleted: false },
            { $or: [
                    { "services.password.validated": true },
                    { "services.google.googleId": { $exists: true } },
                    { "services.facebook.facebookId": { $exists: true } },
                ] },
        ],
    }, (err) => {
        if (err) {
            logger_1.default.log("error", `[ getUser ] An error occurred when fetching the user: ${userId}. Err: ${err}`);
            res.json({ status: 500, message: messages_1.MESSAGE_FAILURE_UNDEFINED, data: { error: err } });
        }
    });
    if (!user) {
        logger_1.default.log("info", `[ getUser ] Could not find user: ${userId}`);
        res.json({ status: 509, message: messages_1.MESSAGE_FAILURE_FIND_USER });
        return;
    }
    res.json({
        email: user.emails && user.emails[0].address,
        facebookId: user.services.facebook.facebookId,
        googleId: user.services.google.googleId,
        loggedIn: user.loggedIn,
        userId: user._id,
        username: user.username,
    });
}
exports.getUser = getUser;
//# sourceMappingURL=getUser.js.map