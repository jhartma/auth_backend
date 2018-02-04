import * as express from "express"
import * as isEmail from "isemail"
import * as uuid from "uuid"
import { Accounts } from "../db"
import { createValidatedUserMessage } from "../lib/emails/createValidatedUserMessage"
import { createValidationToken } from "../lib/helpers/createValidationToken"
import { hashString } from "../lib/helpers/hashString"
import { sendMail } from "../lib/helpers/sendMail"
import { passwordRegex } from "../lib/regex/regex"
import { User } from "../lib/types/user"
import { ACCOUNTS_LIMIT, APP_NAME, APP_URL, EMAIL_ADDRESS, SMTP_PASSWORD, SMTP_PORT, SMTP_SERVER, SMTP_USER } from "../server/config"
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
  MESSAGE_FAILURE_MAX_ACCOUNTS,
} from "../server/messages"

export async function signup({ body: { username, email, password } }: express.Request, res: express.Response): Promise<any> {
  if (!username || username.length < 6) {
    return res.status(500).json({ status: 514, message: MESSAGE_FAILURE_USERNAME_TOO_SHORT })
  }

  if (!password) {
    res.status(500).json({ status: 505, message: MESSAGE_FAILURE_PASSWD_TOO_SHORT })
  }

  // Stop account creation if it exceeds the limit
  const count = (await Accounts.find()).length
  if (count >= parseInt(ACCOUNTS_LIMIT,0) && parseInt(ACCOUNTS_LIMIT,0) > 0) {
    winston.log("error", `[ createUser ] The maximum accounts limit was exceeded`)    
    return res.status(500).json({ status: 518, message: MESSAGE_FAILURE_MAX_ACCOUNTS })    
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
      winston.log("error", `[ createUser ] An error occurred when looking for account for username: ${uname}. Err: ${err}`)
      return res.status(500).json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: err } })
    }
  })

  const checkEmail = await Accounts.findOne({ emails: { $elemMatch: { address: mail } } }, (err: any) => {
    if (err) {
      winston.log("error", `[ createUser ] An error occurred when looking for account for email: ${mail}. Err: ${err}`)
      return res.status(500).json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: err } })
    }
  })

  if (checkUsername) {
    winston.log("info", `[ createUser ] Account for username ${uname} already exists`)
    return res.status(500).json({ status: 503, message: MESSAGE_FAILURE_USER_EXISTS })
  }

  if (checkEmail) {
    winston.log("info", `[ createUser ] Account for email ${mail} already exists`)
    return res.status(500).json({ status: 504, message: MESSAGE_FAILURE_EMAIL_EXISTS })
  }

  if (pw.length < 6) {
    winston.log("info", `[ createUser ] Password is too short: ${pw}`)
    return res.status(500).json({ status: 505, message: MESSAGE_FAILURE_PASSWD_TOO_SHORT })
  }

  // Check if password and email are strings
  if (!passwordRegex.test(pw)) {
    winston.log("info", `[ createUser ] Invalid password: ${pw}`)
    return res.status(500).json({ status: 506, message: MESSAGE_FAILURE_PASSWD_INSECURE })
  }

  if (!isEmail.validate(mail, { checkDNS: false })) {
    winston.log("info", `[ createUser ] Invalid email: ${mail}`)
    return res.status(500).json({ status: 510, message: MESSAGE_FAILURE_EMAIL_INVALID })
  }

  // Generate Password
  const encryptedPassword = await hashString(pw).catch((err) => {
    winston.log("error", `[ createUser ] Could't generate password: ${err}`)
    return res.status(500).json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: err } })
  })

  // Create Validation Token
  const validationToken: string = await createValidationToken().catch((err) => {
    winston.log("error", `[ createUser ] Could't generate validation token: ${err}`)
    res.status(500).json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: err } })
    return ""
  })

  const hashedToken: string = await hashString(validationToken)

  // Write new user to database
  const user: User = {
    _id: uuid.v4(),
    deleted: false,
    emails: [{ address: mail, verified: false }],
    services: {
      password: {
        hash: encryptedPassword,
        resetPasswordDate: Date.now(),
        resetPasswordExpires: Date.now() + (60 * 60 * 10000),
        resetPasswordToken: hashedToken,
      },
    },
    username,
  }

  const createdUser = await Accounts.create(user, (err: any): Promise<any> => {
    if (err) {
      winston.log("error", `[ createUser ] Could't create user: ${err}`)
      res.status(500).json({ status: 502, message: MESSAGE_FAILURE_SAVE_USER, data: { error: err } })
      return
    }
  })

  // Send verification email
  if (createdUser) {
    const subject = `Confirm ${APP_NAME} password`
    const message = createValidatedUserMessage(APP_URL, APP_NAME, validationToken, email)
    const sent = await sendMail(user.emails[0].address, subject, message, { SMTP_PASSWORD, SMTP_USER, SMTP_SERVER, SMTP_PORT, EMAIL_ADDRESS })
      .catch((err: any) => {
        winston.log("error", `[ createUser ] Could't send email: ${err}`)
        res.status(500).json({ status: 507, message: MESSAGE_FAILURE_SEND_MAIL, data: { error: err } })
      })
    if (sent === "done") {
      return res.status(200).json({ status: 200, message: MESSAGE_ACCOUNT_CREATED, data: { username: uname, userId: user._id, validationToken } })
    }
  }
}
