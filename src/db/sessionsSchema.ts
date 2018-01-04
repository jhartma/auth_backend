import * as mongoose from "mongoose"
import Schema from "./schema"

export let SessionsSchema = new Schema({
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
})

let SessionsTmp
try {
  SessionsTmp = mongoose.model("sessions")
} catch (error) {
  SessionsTmp = mongoose.model("sessions", SessionsSchema)
}
export const Sessions = SessionsTmp
