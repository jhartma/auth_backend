import * as express from "express"
import { Accounts } from "../db"
import { forgotPasswordMessage } from "../lib/emails/forgotPasswordMessage"
import { createValidationToken } from "../lib/helpers/createValidationToken"
import { hashBcrypt } from "../lib/helpers/hashBcrypt"
import { hashString } from "../lib/helpers/hashString"
import { sendMail } from "../lib/helpers/sendMail"
import { APP_NAME, APP_URL, EMAIL_ADDRESS, SMTP_PASSWORD, SMTP_PORT, SMTP_SERVER, SMTP_USER } from "../server/config"
import winston from "../server/logger"
import {
  MESSAGE_FAILURE_FIND_USER,
  MESSAGE_FAILURE_SEND_MAIL,
  MESSAGE_FAILURE_VALIDATION_TOKEN,
  MESSAGE_SUCCESS_RESEND_PASSWD,
} from "../server/messages"

/**
 * Sets a password token with an expiry date for the user and
 * sends an email to the user for resetting the password
 */
export async function forgotPassword({ body: { email } }: express.Request, res: express.Response): Promise<void> {
  let errorMessage

  // Generate a validation token which we will send with the email
  const token = await createValidationToken().catch((error) => {
    winston.log("error", "Error while creating validation token", { userId: null, function: "createValidationToken", stacktrace: error })
    errorMessage = MESSAGE_FAILURE_VALIDATION_TOKEN
    res.json({ status: 508, message: MESSAGE_FAILURE_VALIDATION_TOKEN, data: { error } })
    return null
  })

  const tokenHash = await hashString(token)

  // Save the validation token in the user collection
  const user: any = await Accounts.findOne({ $and: [
    { deleted: false },
    { "emails.0.address": email },
  ] }, (err: any, res2: any) => {
    if (err) {
      winston.log("error", "Couldn't write user to db", { userId: null, function: "writeUserToDb", stacktrace: err })
      errorMessage = MESSAGE_FAILURE_FIND_USER
      res.json({ status: 509, message: MESSAGE_FAILURE_FIND_USER, data: { err } })
      return null
    }
    if (!res2) {
      errorMessage = MESSAGE_FAILURE_FIND_USER
      res.json({ status: 509, message: MESSAGE_FAILURE_FIND_USER })
      return null
    }
    res2.services.password.resetPasswordToken = tokenHash // eslint-disable-line no-param-reassign
    res2.services.password.resetPasswordExpires = Date.now() + (60 * 60 * 10000) // eslint-disable-line no-param-reassign
    res2.save((err2: any) => {
      if (!err2) {
        return res2
      }
    })
  })

  if (!user) {
    return null
  }

  // Send the mail with the validation token
  const subject = `Reset your ${APP_NAME} password`
  const message = forgotPasswordMessage(APP_URL, APP_NAME, token, email)

  const res3 = await sendMail(user.emails[0].address, subject, message, { SMTP_PASSWORD, SMTP_USER, SMTP_SERVER, SMTP_PORT, EMAIL_ADDRESS })
    .catch((error: any): any => {
      winston.log("error", "Couldn't send email", { userId: null, function: "sendMail", stacktrace: error })
      errorMessage = MESSAGE_FAILURE_SEND_MAIL
      res.json({ status: 507, message: MESSAGE_FAILURE_SEND_MAIL, data: { error } })
      return null
    })
  // If not in production, sent the token to the client for testing purposes
  if (process.env.NODE_ENV !== "production") {
    res.json({ data: { error: errorMessage, token }, status: 200, message: MESSAGE_SUCCESS_RESEND_PASSWD })
  } else {
    res.json({ data: { error: errorMessage }, status: 200, message: MESSAGE_SUCCESS_RESEND_PASSWD })
  }
}
