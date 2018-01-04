"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passport = require("passport");
const login_1 = require("../lib/login");
const config_1 = require("../server/config");
const messages_1 = require("../server/messages");
async function signin(req, res, next) {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            throw new Error(err);
        }
        const cb = () => res.json({ status: 200, message: messages_1.MESSAGE_SUCCESS_SIGNIN, data: { username: user.username, redirect: config_1.AUTH_REDIRECT } });
        login_1.login(user, req, res, next, cb);
    })(req, res, next);
}
exports.signin = signin;
//# sourceMappingURL=signin.js.map