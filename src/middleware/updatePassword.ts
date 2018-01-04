import * as express from "express"
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
  const userId = req.session.passport.user
  const password = decodeURIComponent(req.query.password)

  // Validations
  if (password.length < 6) {
    winston.log("info", `Password is too short: ${password}`)
    res.json({ status: 505, message: MESSAGE_FAILURE_PASSWD_TOO_SHORT })
    return null
  }

  // Check if password and email are strings
  if (!passwordRegex.test(password)) {
    winston.log("info", `Invalid password: ${password}`)
    res.json({ status: 506, message: MESSAGE_FAILURE_PASSWD_INSECURE })
    return null
  }

  // Encrypt password
  const encryptedPassword = await hashString(password).catch((err) => {
    winston.log("error", `[ hashString ] Could't generate password: ${err}`)
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
