"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createValidatedUserMessage(APP_URL, APP_NAME, token, email) {
    const link = `https://${APP_URL}/confirm-account/${token}/${email}`;
    return `You are receiving this because you (or someone else) have created a ${APP_NAME} account.\n\n
  Please click on the following link, or paste this into your browser to complete the process:\n\n
  ${link} \n\n
  If you did not request this, please ignore this email and your password will remain unchanged.\n`;
}
exports.createValidatedUserMessage = createValidatedUserMessage;
//# sourceMappingURL=createValidatedUserMessage.js.map