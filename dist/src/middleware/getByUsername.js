"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const logger_1 = require("../server/logger");
const messages_1 = require("../server/messages");
async function getByUsername(req, res) {
    const username = req.params.username;
    const user = await db_1.Accounts.findOne({
        $and: [
            { username },
            { deleted: false },
            { $or: [
                    { "services.password.validated": true },
                    { "services.google.googleId": { $exists: true } },
                    { "services.facebook.facebookId": { $exists: true } },
                ] },
        ],
    }, (err) => {
        if (err) {
            logger_1.default.log("error", `[ getByUsername ] An error occurred when fetching the user: ${username}. Err: ${err}`);
            res.json({ status: 500, message: messages_1.MESSAGE_FAILURE_UNDEFINED, data: { error: err } });
        }
    });
    if (!user) {
        logger_1.default.log("info", `[ getByUsername ] Could not find user: ${username}`);
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
exports.getByUsername = getByUsername;
//# sourceMappingURL=getByUsername.js.map