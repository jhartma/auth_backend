"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../server/messages");
async function login(user, req, res, next, cb) {
    if (user) {
        req.login(user, (error) => {
            if (error) {
                next(error);
            }
            cb();
        });
    }
    else {
        res.json({ status: 513, message: messages_1.MESSAGE_FAILURE_WRONG_CREDENTIALS });
    }
}
exports.login = login;
//# sourceMappingURL=login.js.map