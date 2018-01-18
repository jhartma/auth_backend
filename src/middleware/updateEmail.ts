import { pathOr } from "ramda"
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
  const dev = process.env.NODE_ENV !== "production"

  // For security reasons, we identify the user via the sessionId
  const userId = dev ? pathOr(null, [ "query", "userId" ], req) : pathOr(null, [ "session", "passport", "user", "_id" ], req)
  const email = pathOr(null, [ "query", "email" ], req)
  const sessionId = pathOr(null, [ "session", "id" ], req)

  if (!userId || !email || !sessionId) {
    winston.log("error", `[ updateEmail ] An error occurred: ${email}. Err: Wrong session credentials`)
    res.json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: "Wrong session credentials" } })
    return
  }


  // Validations: Duplicates
  const checkEmail = await Accounts.findOne({ $and: [
    { deleted: false },
    { emails: { $elemMatch: { address: email } } },
  ]}, (err: any) => {
    if (err) {
      winston.log("error", `[ updateEmail ] An error occurred when looking for account for email: ${email}. Err: ${err}`)
      res.json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: err } })
    }
  })

  if (checkEmail) {
    winston.log("info", `[ updateEmail ] Account for email ${email} already exists`)
    res.json({ status: 504, message: MESSAGE_FAILURE_EMAIL_EXISTS })
    return
  }

  if (!isEmail.validate(email, { checkDNS: false })) {
    winston.log("info", `[ updateEmail ] Invalid email: ${email}`)
    res.json({ status: 510, message: MESSAGE_FAILURE_EMAIL_INVALID })
    return
  }

  // Update users email address in the accounts collection
  const account: any = await Accounts.findOne({ _id: userId })
  const existingMail = account.emails && account.emails[0] && account.emails[0].address
  if (existingMail) {
    // If an email exists, we just update the field
    await Accounts.update({ _id: userId }, { $set: { "emails.0.address": email } }, (err: any) => {
      if (err) {
        res.json({ status: 512, message: MESSAGE_FAILURE_UPDATE_USER, data: { error: err }})
        return
      }
    })
  } else {
    // If for whatever reasons the email field does not exist
    await Accounts.update({ _id: userId }, { $set: { emails: [{ address: email }] } }, (err: any) => {
      if (err) {
        res.json({ status: 512, message: MESSAGE_FAILURE_UPDATE_USER, data: { error: err }})
        return
      }
    })
  }

  winston.log("info", `[ updateEmail ] user ${userId} updated his/her email address to ${email}`)
  const user = await Accounts.findOne({ _id: userId })

  // Since we store the email information also in the sessions collection, we need to update it, too
  await Sessions.update({ _id: sessionId }, { $set: { "session.passport.user.email": email } })

  // Send the modified user back
  res.json({ status: 200, message: MESSAGE_SUCCESS_UPDATE_USER, data: { user }})
}
