"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../server/messages");
function signout(req, res, next) {
    req.logout();
    res.json({ status: 200, message: messages_1.MESSAGE_SUCCESS_SIGNOUT });
}
exports.signout = signout;
//# sourceMappingURL=signout.js.map