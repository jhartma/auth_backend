"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
function createValidationToken() {
    return new Promise((resolve) => {
        crypto.randomBytes(20, (err, buf) => {
            resolve(buf.toString("hex"));
        });
    });
}
exports.createValidationToken = createValidationToken;
//# sourceMappingURL=createValidationToken.js.map