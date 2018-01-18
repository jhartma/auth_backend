import * as express from "express"
import { Accounts } from "../db"
import { hashBcrypt } from "../lib/helpers/hashBcrypt"
import { hashString } from "../lib/helpers/hashString"
import { passwordRegex } from "../lib/regex/regex"
import winston from "../server/logger"
import {
  MESSAGE_FAILURE_FIND_USER,
  MESSAGE_FAILURE_INVALID_TOKEN,
  MESSAGE_FAILURE_PASSWD_INSECURE,
  MESSAGE_FAILURE_SAVE_PASSWD,
  MESSAGE_FAILURE_UNDEFINED,
  MESSAGE_SUCCESS_RESET_PASSWD,
} from "../server/messages"

const securePassword = require('secure-password')

/**
 * Saves a new password and resets the reset token
 * given that the user and token are valid
 */
export async function resetPassword({ body: { token, password, email } }: express.Request, res: express.Response): Promise<void> {
  let errorMessage

  if (!token) {
    res.json({ status: 501, message: MESSAGE_FAILURE_INVALID_TOKEN })
    return null
  }

  if (!email) {
    res.json({ status: 509, message: MESSAGE_FAILURE_FIND_USER })
    return null
  }

  // Check if password and email are strings
  if (!passwordRegex.test(password)) {
    winston.log("info", `Invalid password: ${password}`)
    res.json({ status: 506, message: MESSAGE_FAILURE_PASSWD_INSECURE })
    return
  }

  // Encrypt password
  const generatedPassword = await hashString(password).catch((error) => {
    winston.log("error", "[ resetPassword ] Error while generating password", { userId: null, function: "hashString", stacktrace: error })
    errorMessage = "Error: Couldn't generate password!"
    res.json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED })
    return null
  })

  const hash = await hashString(token)

  // Find user by email and expiration date
  const user: any = await Accounts.findOne({
    $and: [
      { deleted: false },
      { emails: { $elemMatch: { address: email } } },
      { "services.password.resetPasswordExpires": { $gte: new Date() } },
    ],
  }, (error: any, user2: any): any => {
    if (error) {
      errorMessage = "Error: Couldn't find user!"
      res.json({ status: 509, message: MESSAGE_FAILURE_FIND_USER, data: { error } })
      return null
    }
  })

  if (user) {
    // Check if token conforms to hashed token in db
    const pwd = securePassword()
    const userPassword = Buffer.from(token)
    const tokenVerificationResult = pwd.verifySync(userPassword, user.services.password.resetPasswordToken)

    if (tokenVerificationResult !== securePassword.VALID) {
      res.json({ status: 501, message: MESSAGE_FAILURE_INVALID_TOKEN })
      return null
    }

    // Re-initialize the password
    user.services.password.hash = generatedPassword // eslint-disable-line no-param-reassign
    user.services.password.resetPasswordToken = "" // eslint-disable-line no-param-reassign
    user.services.password.resetPasswordDate = Date.now() // eslint-disable-line no-param-reassign
    user.services.password.resetPasswordExpires = null // eslint-disable-line no-param-reassign

    // Save user object to db
    user.save((err3: any): any => {
      if (err3) {
        errorMessage = "Error: Couldn't update the password!"
        res.json({ status: 511, message: MESSAGE_FAILURE_SAVE_PASSWD, data: { error: err3 } })
        return null
      }
      res.json({ status: 200, message: MESSAGE_SUCCESS_RESET_PASSWD, data: { user } })
      return null
    })
  } else {
    errorMessage = "Error: The link is either invalid or has expired. Please resend your email address!"
    res.json({ status: 501, message: MESSAGE_FAILURE_INVALID_TOKEN })
    return null
  }
}
