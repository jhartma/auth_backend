import * as express from "express"
import { pathOr } from "ramda"
import { Accounts } from "../db"
import { login } from "../lib/login"
import winston from "../server/logger"
import {
  MESSAGE_ACCOUNT_CONFIRMED_FAILURE,
  MESSAGE_ACCOUNT_CONFIRMED_SUCCESS,
  MESSAGE_FAILURE_INVALID_TOKEN,
  MESSAGE_FAILURE_SAVE_USER,
} from "../server/messages"

const securePassword = require('secure-password')

/**
 * Validates a new user when he clicks on the confirmation email link
 * @param  {String} token  [ The validation token ]
 * @return {Object}        [ Returns the username ]
 */

export async function confirmAccount(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
  const token = pathOr(null, [ "params", "token" ], req)
  const email = pathOr(null, [ "params", "email" ], req)

  if (!token) {
    winston.log("error", `[ confirmAccount ] Error finding user for token ${token}`)
    res.json({ status: 501, message: MESSAGE_FAILURE_INVALID_TOKEN })
    return null
  }

  if (!email) {
    winston.log("error", `[ confirmAccount ] Error finding user for email ${email}`)
    res.json({ status: 501, message: MESSAGE_FAILURE_INVALID_TOKEN })
    return null
  }

  const user: any = await Accounts.findOne({
    $and: [
      { deleted: false },
      { emails: { $elemMatch: { address: email } } },
      { "services.password.resetPasswordExpires": { $gte: new Date() } },
    ],
  }, (err: any, res2: any): any => {
    if (err) {
      winston.log("error", `[ confirmAccount ] Error finding user for token ${token}: ${err}`)
      res.json({ status: 501, message: MESSAGE_FAILURE_INVALID_TOKEN, data: { error: err } })
      return null
    }
  })

  // If user does not exist or has expired
  if (!user) {
    winston.log("info", `Couldnt find user for token: ${token}`)
    res.json({ status: 501, message: MESSAGE_FAILURE_INVALID_TOKEN })
    return
  }

  // Check if token conforms to hashed token in db
  const pwd = securePassword()
  const bufferedToken = Buffer.from(token)
  const tokenVerificationResult = pwd.verifySync(bufferedToken, user.services.password.resetPasswordToken)

  if (tokenVerificationResult !== securePassword.VALID) {
    res.json({ status: 501, message: MESSAGE_FAILURE_INVALID_TOKEN })
    return null
  }

  // Validate user
  user.services.password.resetPasswordToken = null // eslint-disable-line no-param-reassign
  user.services.password.resetPasswordExpires = null // eslint-disable-line no-param-reassign
  user.services.password.validated = true // eslint-disable-line no-param-reassign

  // Save validated user
  user.save((err: any) => {
    if (err) {
      winston.log("error", `[ confirmAccount ] Error creating user for token ${token}: ${err}`)
      res.json({ status: 502, message: MESSAGE_FAILURE_SAVE_USER, data: { error: err } })
      return
    }
    // Login user
    const cb = () => res.json({ status: 200, message: MESSAGE_ACCOUNT_CONFIRMED_SUCCESS, data: { username: user.username, userId: user._id } })
    login(user, req, res, next, cb)
  })
}
