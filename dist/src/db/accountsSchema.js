"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const schema_1 = require("./schema");
exports.AccountSchema = new schema_1.default({
    _id: String,
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    emails: [{
            address: { type: String, default: null },
            verified: { type: Boolean, default: false },
        }, { _id: false }],
    services: {
        facebook: {
            facebookId: { type: String, default: null },
        },
        google: {
            googleId: { type: String, default: null },
        },
        password: {
            hash: { type: Buffer },
            resetPasswordExpires: { type: Date, default: null },
            resetPasswordToken: { type: Buffer, default: null },
            validated: { type: Boolean, default: false },
        },
    },
    username: { type: String, default: "", index: "text" },
}, {
    timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
    },
});
let AccountsTmp;
try {
    AccountsTmp = mongoose.model("accounts");
}
catch (error) {
    AccountsTmp = mongoose.model("accounts", exports.AccountSchema);
}
exports.Accounts = AccountsTmp;
//# sourceMappingURL=accountsSchema.js.map