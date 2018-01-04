"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const hashString_1 = require("../lib/helpers/hashString");
const regex_1 = require("../lib/regex/regex");
const logger_1 = require("../server/logger");
const messages_1 = require("../server/messages");
async function updatePassword(req, res, next) {
    const userId = req.session.passport.user;
    const password = decodeURIComponent(req.query.password);
    if (password.length < 6) {
        logger_1.default.log("info", `Password is too short: ${password}`);
        res.json({ status: 505, message: messages_1.MESSAGE_FAILURE_PASSWD_TOO_SHORT });
        return null;
    }
    if (!regex_1.passwordRegex.test(password)) {
        logger_1.default.log("info", `Invalid password: ${password}`);
        res.json({ status: 506, message: messages_1.MESSAGE_FAILURE_PASSWD_INSECURE });
        return null;
    }
    const encryptedPassword = await hashString_1.hashString(password).catch((err) => {
        logger_1.default.log("error", `[ hashString ] Could't generate password: ${err}`);
        res.json({ status: 500, message: messages_1.MESSAGE_FAILURE_UNDEFINED, data: { error: err } });
        return null;
    });
    await db_1.Accounts.update({ $and: [
            { deleted: false },
            { _id: userId },
        ] }, { $set: { "services.password.hash": encryptedPassword } }, (err) => {
        if (err) {
            res.json({ status: 512, message: messages_1.MESSAGE_FAILURE_SAVE_PASSWD, data: { error: err } });
        }
    });
    logger_1.default.log("info", `[ updatePassword ] user ${userId} updated his/her password`);
    const user = await db_1.Accounts.findOne({ _id: userId }).lean().exec((res2) => res2);
    res.json({ status: 200, message: messages_1.MESSAGE_SUCCESS_UPDATE_USER, data: { user } });
}
exports.updatePassword = updatePassword;
//# sourceMappingURL=updatePassword.js.map