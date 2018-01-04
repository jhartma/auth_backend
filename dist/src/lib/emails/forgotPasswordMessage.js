"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function forgotPasswordMessage(APP_URL, APP_NAME, token, email) {
    const link = `https://${APP_URL}/reset-password/${token}/${email}`;
    return `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
    Please click on the following link, or paste this into your browser to complete the process:\n\n
    ${link} \n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`;
}
exports.forgotPasswordMessage = forgotPasswordMessage;
//# sourceMappingURL=forgotPasswordMessage.js.map