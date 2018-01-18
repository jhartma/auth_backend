import { Accounts } from "../../db/index"
import winston from "../../server/logger"

const securePassword = require("secure-password")

/**
 * Checks whether password and username are correct for login
 * @param  {String} username [ the user's username ]
 * @param  {String} password [ the user's password]
 * @return {Object}          [ a PasswordJs object which contains the user object and a message ]
 */
export async function verifyLoginCredentials({ username, password }: any): Promise<any> {
  // Check if username exists
  const user: any = await Accounts.findOne({
    $and: [
      { deleted: false },
      { username },
      { "services.password.validated": true },  // only return validated users
    ],
  })

  if (!user) {
    winston.log("warn", `Unsuccessfull login attempt with login ${username}, pw: ${password}`)
    return { user: null, message: "User not found" }
  }

  // Check if password is a buffer
  if (!Buffer.isBuffer(user.services.password.hash)) {
    winston.log("error", `[ verifyLoginCredentials ] user ${user._id} provided a password which is not a buffer`)
    return { user: null }
  }

  return new Promise((resolve) => {
    const pwd = securePassword()
    const passwordBuffer = Buffer.from(password)

    pwd.verify(passwordBuffer, user.services.password.hash, (err: any, result: any) => {
      if (result === securePassword.INVALID_UNRECOGNIZED_HASH) {
        winston.log("error", `[ verifyLoginCredentials ] user ${user._id} provided a password not made with secure-password`)
        return resolve({ user: null })
      } else if (result === securePassword.INVALID) {
        winston.log("info", `[ verifyLoginCredentials ] User ${user._id} provided a false password.`)
        return resolve({ user: null })
      }
      if (result === securePassword.VALID) {
        winston.log("info", `[ verifyLoginCredentials ] User ${user._id} successfully logged in.`)
        return resolve({ user })
      }
    })
  })
}
