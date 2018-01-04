"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const securePassword = require("secure-password");
function hashString(password) {
    return new Promise((resolve, reject) => {
        const pwd = securePassword();
        const passwordBuffer = Buffer.from(password);
        return pwd.hash(passwordBuffer, (err, hash) => {
            if (err) {
                reject(err);
            }
            resolve(hash);
        });
    });
}
exports.hashString = hashString;
//# sourceMappingURL=hashString.js.map