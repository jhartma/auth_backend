"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcrypt");
const saltRounds = 12;
async function hashBcrypt(text) {
    return new Promise((resolve) => {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            return bcrypt.hash(text, salt, (err2, hash) => {
                resolve(hash);
            });
        });
    });
}
exports.hashBcrypt = hashBcrypt;
//# sourceMappingURL=hashBcrypt.js.map