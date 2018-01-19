import * as express from "express"
import { pathOr } from "ramda"
import { Accounts, Sessions } from "../db"
import winston from "../server/logger"
import {
  MESSAGE_FAILURE_UNDEFINED,
  MESSAGE_FAILURE_UPDATE_USER,
  MESSAGE_FAILURE_USER_EXISTS,
  MESSAGE_SUCCESS_UPDATE_USER,
} from "../server/messages"

export async function updateUsername(req: any, res: express.Response, next: express.NextFunction): Promise<any> {
  const test = process.env.NODE_ENV === "test"

  const userId = test ? pathOr(null, [ "query", "userId" ], req) : pathOr(null, [ "session", "passport", "user", "_id" ], req)
  const username = pathOr(null, [ "query", "username" ], req)
  const sessionId = pathOr(null, [ "session", "id" ], req)

  if (!userId || !username || !sessionId) {
    winston.log("error", `[ updateUsername ] An error occurred: ${username}. Err: Wrong session credentials`)
    res.json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: "Wrong session credentials" } })
    return
  }

  // ToDo: username too short

  // Check if user already exists
  const usernameExists = await Accounts.findOne({ $and: [
    { deleted: false },
    { username },
  ] }, (err: any) => {
    if (err) {
      winston.log("error", `[ updateUsername ] An error occurred when looking for account for username: ${username}. Err: ${err}`)
      res.json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: err } })
      return
    }
  })

  if (usernameExists) {
    winston.log("info", `[ updateUsername ] Account for username ${username} already exists`)
    res.json({ status: 503, message: MESSAGE_FAILURE_USER_EXISTS })
    return
  }

  // Update username
  await Accounts.update({ $and: [
    { deleted: false },
    { _id: userId },
  ]}, {
    $set: { username },
  }, (err: any) => { if (err) { throw new Error(err) } })
  winston.log("info", `[ updateUsername ] user ${userId} updated his/her username to ${username}`)
  
  const user = await Accounts.findOne({ $and: [
    { deleted: false },
    { _id: userId },
  ] })

  // Since we store the email information also in the sessions collection, we need to update it, too
  await Sessions.update({ _id: sessionId }, { $set: { "session.passport.user.username": username } }, (err: any) => {
    if (err) {
      res.json({ status: 512, message: MESSAGE_FAILURE_UPDATE_USER, data: { error: err } })
      return
    }
  })

  // Send the modified user back
  return res.json({ status: 200, message: MESSAGE_SUCCESS_UPDATE_USER, data: { user } })
}
