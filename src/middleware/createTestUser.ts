import * as uuid from "uuid"
import { Accounts } from "../db"
import { hashString } from "../lib/helpers/hashString"
import winston from "../server/logger"

export async function createTestUser({ body: { username, email, password } }: any, res: any) {
  if (!process.env.INTEGRATION) {
    res.json({ status: "error" })
    return
  }

  if (!password || !email) {
    res.json({ status: 505, message: "No password or email!" })
    return
  }

  const pw = password
  const mail = email.toLowerCase()

  // Generate Password
  const encryptedPassword = await hashString(pw).catch((err) => {
    winston.log("error", `[ hashString ] Could't generate password: ${err}`)
    res.json({ error: { message: err } })
    return null
  })

  // Write new user to database
  const user = {
    _id: username === "jhartma" ? "1" : uuid.v4(),
    deleted: false,
    emails: [{ address: mail, verified: false }],
    services: {
      password: {
        hash: encryptedPassword,
        validated: true,
      },
    },
    username,
  }

  await Accounts.create(user, (err: any): any => {
    if (err) {
      winston.log("error", `Could't create user: ${err}`)
      res.json({ error: { message: err } })
      return null
    }
  })
  res.json({ status: "done", user: await Accounts.findOne({ _id: user._id }) })
}
