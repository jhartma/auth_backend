import * as mongoose from "mongoose"
import Schema from "./schema"

export const AccountSchema = new Schema({
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
})
// AccountSchema.index({ username: "text" })


let AccountsTmp
try {
  AccountsTmp = mongoose.model("accounts")
} catch (error) {
  AccountsTmp = mongoose.model("accounts", AccountSchema)
}
export const Accounts = AccountsTmp
