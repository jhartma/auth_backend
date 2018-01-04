"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../db/index");
const logger_1 = require("../../server/logger");
const securePassword = require("secure-password");
async function verifyLoginCredentials({ username, password }) {
    const user = await index_1.Accounts.findOne({
        $and: [
            { deleted: false },
            { username },
            { "services.password.validated": true },
        ],
    });
    if (!user) {
        logger_1.default.log("warn", `Unsuccessfull login attempt with login ${username}, pw: ${password}`);
        return { user: null, message: "User not found" };
    }
    if (!Buffer.isBuffer(user.services.password.hash)) {
        logger_1.default.log("error", `user ${user._id} provided a password which is not a buffer`);
        return { user: null };
    }
    return new Promise((resolve) => {
        const pwd = securePassword();
        const passwordBuffer = Buffer.from(password);
        pwd.verify(passwordBuffer, user.services.password.hash, (err, result) => {
            if (result === securePassword.INVALID_UNRECOGNIZED_HASH) {
                logger_1.default.log("error", `user ${user._id} provided a password not made with secure-password`);
                return resolve({ user: null });
            }
            else if (result === securePassword.INVALID) {
                logger_1.default.log("info", `User ${user._id} provided a false password.`);
                return resolve({ user: null });
            }
            if (result === securePassword.VALID) {
                logger_1.default.log("info", `User ${user._id} successfully logged in.`);
                return resolve({ user });
            }
        });
    });
}
exports.verifyLoginCredentials = verifyLoginCredentials;
//# sourceMappingURL=verifyLoginCredentials.js.map