import * as express from "express"
import { Accounts, Sessions } from "../db"
import winston from "../server/logger"
import {
  MESSAGE_FAILURE_UNDEFINED,
  MESSAGE_FAILURE_UPDATE_USER,
  MESSAGE_FAILURE_USER_EXISTS,
  MESSAGE_SUCCESS_UPDATE_USER,
} from "../server/messages"

export async function updateUsername(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> {
  const userId = req.session.passport.user._id
  const username = req.query.username
  const sessionId = req.session.id

  // Check if user already exists
  const usernameExists = await Accounts.findOne({ $and: [
    { deleted: false },
    { username },
  ] }, (err) => {
    if (err) {
      winston.log("error", `[ usernameExists ] An error occurred when looking for account for username: ${username}. Err: ${err}`)
      res.json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: err } })
      return
    }
  })

  if (usernameExists) {
    winston.log("info", `Account for username ${username} already exists`)
    res.json({ status: 503, message: MESSAGE_FAILURE_USER_EXISTS })
    return
  }

  // Update username
  await Accounts.update({ $and: [
    { deleted: false },
    { _id: userId },
  ]}, {
    $set: { username },
  }, (err) => { if (err) { throw new Error(err) } })
  winston.log("info", `[ updateUsername ] user ${userId} updated his/her username to ${username}`)
  const user = await Accounts.findOne({ $and: [
    { deleted: false },
    { _id: userId },
  ] }).lean().exec((res2) => res2)

  // Since we store the email information also in the sessions collection, we need to update it, too
  await Sessions.update({ _id: sessionId }, { $set: { "session.passport.user.username": username } }, (err) => {
    if (err) {
      res.json({ status: 512, message: MESSAGE_FAILURE_UPDATE_USER, data: { error: err } })
      return
    }
  })

  // Send the modified user back
  return res.json({ status: 200, message: MESSAGE_SUCCESS_UPDATE_USER, data: { user } })
}
