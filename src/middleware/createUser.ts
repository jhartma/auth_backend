import * as express from "express"
import * as isEmail from "isemail"
import * as uuid from "uuid"
import { Accounts } from "../db"
import { createValidatedUserMessage } from "../lib/emails/createValidatedUserMessage"
import { createValidationToken } from "../lib/helpers/createValidationToken"
import { hashString } from "../lib/helpers/hashString"
import { sendMail } from "../lib/helpers/sendMail"
import { passwordRegex } from "../lib/regex/regex"
import { APP_NAME, APP_URL, EMAIL_ADDRESS, SMTP_PASSWORD, SMTP_PORT, SMTP_SERVER, SMTP_USER } from "../server/config"
import winston from "../server/logger"
import {
  MESSAGE_ACCOUNT_CREATED,
  MESSAGE_FAILURE_EMAIL_EXISTS,
  MESSAGE_FAILURE_EMAIL_INVALID,
  MESSAGE_FAILURE_PASSWD_INSECURE,
  MESSAGE_FAILURE_PASSWD_TOO_SHORT,
  MESSAGE_FAILURE_SAVE_USER,
  MESSAGE_FAILURE_SEND_MAIL,
  MESSAGE_FAILURE_UNDEFINED,
  MESSAGE_FAILURE_USER_EXISTS,
  MESSAGE_FAILURE_USERNAME_TOO_SHORT,
} from "../server/messages"

export async function createUser({ body: { username, email, password } }: express.Request, res: express.Response): Promise<void> {
  if (!username || username.length < 6) {
    res.json({ status: 505, message: MESSAGE_FAILURE_USERNAME_TOO_SHORT })
    return
  }

  if (!password) {
    res.json({ status: 505, message: MESSAGE_FAILURE_PASSWD_TOO_SHORT })
    return
  }

  const uname = username.toLowerCase()
  const pw = password
  const mail = email.toLowerCase()

  // Check if user already exists
  const checkUsername = await Accounts.findOne({ $and: [
    { deleted: false },
    { username: uname },
  ]}, (err: any) => {
    if (err) {
      winston.log("error", `[ checkUsername ] An error occurred when looking for account for username: ${uname}. Err: ${err}`)
      res.json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: err } })
      return
    }
  })

  const checkEmail = await Accounts.findOne({ emails: { $elemMatch: { address: mail } } }, (err) => {
    if (err) {
      winston.log("error", `[ checkEmail ] An error occurred when looking for account for email: ${mail}. Err: ${err}`)
      res.json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: err } })
      return
    }
  })

  if (checkUsername) {
    winston.log("info", `Account for username ${uname} already exists`)
    res.json({ status: 503, message: MESSAGE_FAILURE_USER_EXISTS })
    return
  }

  if (checkEmail) {
    winston.log("info", `Account for email ${mail} already exists`)
    res.json({ status: 504, message: MESSAGE_FAILURE_EMAIL_EXISTS })
    return
  }

  if (pw.length < 6) {
    winston.log("info", `Password is too short: ${pw}`)
    res.json({ status: 505, message: MESSAGE_FAILURE_PASSWD_TOO_SHORT })
    return
  }

  // Check if password and email are strings
  if (!passwordRegex.test(pw)) {
    winston.log("info", `Invalid password: ${pw}`)
    res.json({ status: 506, message: MESSAGE_FAILURE_PASSWD_INSECURE })
    return
  }

  if (!isEmail.validate(mail, { checkDNS: false })) {
    winston.log("info", `Invalid email: ${mail}`)
    res.json({ status: 510, message: MESSAGE_FAILURE_EMAIL_INVALID })
    return
  }

  // Generate Password
  const encryptedPassword = await hashString(pw).catch((err) => {
    winston.log("error", `[ hashString ] Could't generate password: ${err}`)
    res.json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: err } })
    return null
  })

  // Create Validation Token
  const validationToken = await createValidationToken().catch((err) => {
    winston.log("error", `[ createValidationToken ] Could't generate validation token: ${err}`)
    res.json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: err } })
    return null
  })
  const hashedToken = await hashString(validationToken)

  // Write new user to database
  const user = {
    _id: uuid.v4(),
    emails: [{ address: mail, verified: false }],
    services: {
      password: {
        hash: encryptedPassword,
        resetPasswordExpires: Date.now() + (60 * 60 * 10000),
        resetPasswordToken: hashedToken,
      },
    },
    username,
  }

  const createdUser = await Accounts.create(user, (err: any): Promise<any> => {
    if (err) {
      winston.log("error", `Could't create user: ${err}`)
      res.json({ status: 502, message: MESSAGE_FAILURE_SAVE_USER, data: { error: err } })
      return null
    }
  })

  // Send verification email
  if (createdUser) {
    const subject = `Confirm ${APP_NAME} password`
    const message = createValidatedUserMessage(APP_URL, APP_NAME, validationToken, email)
    sendMail(user.emails[0].address, subject, message, { SMTP_PASSWORD, SMTP_USER, SMTP_SERVER, SMTP_PORT, EMAIL_ADDRESS })
      .catch((err: any) => {
        winston.log("error", `Could't send email: ${err}`)
        res.json({ status: 507, message: MESSAGE_FAILURE_SEND_MAIL, data: { error: err } })
      }).then(() => {
        res.json({ status: 200, message: MESSAGE_ACCOUNT_CREATED, data: { username: uname, userId: user._id, validationToken } })
      })
  }
}
