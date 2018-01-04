"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const schema_1 = require("./schema");
exports.SessionsSchema = new schema_1.default({
    _id: String,
    session: {
        passport: {
            user: {
                _id: String,
                email: String,
                username: String,
            },
        },
    },
});
let SessionsTmp;
try {
    SessionsTmp = mongoose.model("sessions");
}
catch (error) {
    SessionsTmp = mongoose.model("sessions", exports.SessionsSchema);
}
exports.Sessions = SessionsTmp;
//# sourceMappingURL=sessionsSchema.js.map