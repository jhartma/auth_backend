import * as express from "express"
import { pathOr } from "ramda"
import { Accounts } from "../db"
import { hashString } from "../lib/helpers/hashString"
import { passwordRegex } from "../lib/regex/regex"
import winston from "../server/logger"
import {
  MESSAGE_FAILURE_PASSWD_INSECURE,
  MESSAGE_FAILURE_PASSWD_TOO_SHORT,
  MESSAGE_FAILURE_SAVE_PASSWD,
  MESSAGE_FAILURE_UNDEFINED,
  MESSAGE_SUCCESS_UPDATE_USER,
} from "../server/messages"

export async function updatePassword(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
  const dev = process.env.NODE_ENV !== "production"

    // For security reasons, we identify the user via the sessionId
  const userId = dev ? pathOr(null, [ "query", "userId" ], req) : pathOr(null, [ "session", "passport", "user", "_id" ], req)
  const password = decodeURIComponent(pathOr(null, [ "query", "password" ], req))

  if (!userId) {
    winston.log("error", `[ updatePassword ] An error occurred: Wrong session credentials`)
    res.json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: "Wrong session credentials" } })
    return
  }

  // Validations
  if (password.length < 6) {
    winston.log("info", `[ updatePassword ] Password is too short: ${password}`)
    res.json({ status: 505, message: MESSAGE_FAILURE_PASSWD_TOO_SHORT })
    return null
  }

  // Check if password and email are strings
  if (!passwordRegex.test(password)) {
    winston.log("info", `[ updatePassword ] Invalid password: ${password}`)
    res.json({ status: 506, message: MESSAGE_FAILURE_PASSWD_INSECURE })
    return null
  }

  // Encrypt password
  const encryptedPassword = await hashString(password).catch((err) => {
    winston.log("error", `[ updatePassword ] Could't generate password: ${err}`)
    res.json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: err } })
    return null
  })

  // Update password
  await Accounts.update({ $and: [
    { deleted: false },
    { _id: userId },
  ]}, { $set: { "services.password.hash": encryptedPassword } }, (err) => {
    if (err) {
      res.json({ status: 512, message: MESSAGE_FAILURE_SAVE_PASSWD, data: { error: err } })
    }
  })

  winston.log("info", `[ updatePassword ] user ${userId} updated his/her password`)
  const user = await Accounts.findOne({ _id: userId }).lean().exec((res2: any) => res2)
  res.json({ status: 200, message: MESSAGE_SUCCESS_UPDATE_USER, data: { user } })
}
