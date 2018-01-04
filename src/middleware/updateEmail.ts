import * as express from "express"
import * as isEmail from "isemail"
import { Accounts, Sessions } from "../db"
import winston from "../server/logger"
import {
  MESSAGE_FAILURE_EMAIL_EXISTS,
  MESSAGE_FAILURE_EMAIL_INVALID,
  MESSAGE_FAILURE_UNDEFINED,
  MESSAGE_FAILURE_UPDATE_USER,
  MESSAGE_SUCCESS_UPDATE_USER,
} from "../server/messages"

export async function updateEmail(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
  // For security reasons, we identify the user via the sessionId
  const userId = req.session.passport.user._id
  const email = req.query.email
  const sessionId = req.session.id

  // Validations
  const checkEmail = await Accounts.findOne({ $and: [
    { deleted: false },
    { emails: { $elemMatch: { address: email } } },
  ]}, (err) => {
    if (err) {
      winston.log("error", `[ checkEmail ] An error occurred when looking for account for email: ${email}. Err: ${err}`)
      res.json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: err } })
    }
  })

  if (checkEmail) {
    winston.log("info", `Account for email ${email} already exists`)
    res.json({ status: 504, message: MESSAGE_FAILURE_EMAIL_EXISTS })
    return
  }

  if (!isEmail.validate(email, { checkDNS: false })) {
    winston.log("info", `Invalid email: ${email}`)
    res.json({ status: 510, message: MESSAGE_FAILURE_EMAIL_INVALID })
    return
  }

  // Update users email address in the accounts collection
  await Accounts.update({ _id: userId }, { $set: { "emails.0.address": email } }, (err) => {
    if (err) {
      res.json({ status: 512, message: MESSAGE_FAILURE_UPDATE_USER, data: { error: err }})
    }
  })

  winston.log("info", `[ updateEmail ] user ${userId} updated his/her email address to ${email}`)
  const user = await Accounts.findOne({ _id: userId }).lean().exec((res2) => res2)

  // Since we store the email information also in the sessions collection, we need to update it, too
  await Sessions.update({ _id: sessionId }, { $set: { "session.passport.user.email": email } })

  // Send the modified user back
  res.json({ status: 200, message: MESSAGE_SUCCESS_UPDATE_USER, data: { user }})
}
