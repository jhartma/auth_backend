import { pathOr } from "ramda"
import { Accounts, Sessions } from "../db"
import winston from "../server/logger"
import { MESSAGE_FAILURE_FIND_USER, MESSAGE_FAILURE_NO_USER, MESSAGE_FAILURE_REMOVE_USER, MESSAGE_FAILURE_UNDEFINED, MESSAGE_SUCCESS_REMOVE_USER } from "../server/messages"

export async function removeUser(req: any, res: any, next: any) {
  const test = process.env.NODE_ENV === "test"

  // For security reasons, we identify the user via the sessionId
  const userId = test ? pathOr(null, [ "query", "userId" ], req) : pathOr(null, [ "session", "passport", "user", "_id" ], req)
  const sessionId = pathOr(undefined, [ "session", "id" ], req)

  if (!userId || !sessionId) {
    winston.log("info", "[ removeUser ] Unauthorized attempt to delete user")
    res.json({ status: 509, message: MESSAGE_FAILURE_FIND_USER })
    return
  }

  // Check if user exists
  const user = await Accounts.findOne({ $and: [
    { deleted: false },
    { _id: userId },
  ] }, (err: any) => {
    if (err) {
      winston.log("error", `[ removeUser ] An error occurred when looking for account for username: ${userId}. Err: ${err}`)
      res.json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: err } })
      return
    }
  })

  if (!user) {
    winston.log("error", `[ removeUser ] An error occurred when looking for account for username: ${userId}.}`)
    res.json({ status: 515, message: MESSAGE_FAILURE_NO_USER })
    return
  }

  // Remove user
  await Accounts.update({ _id: userId }, { $set: { deleted: true, deletedAt: (new Date().toISOString()) } }, (err) => {
    if (err) {
      res.json({ status: 516, message: MESSAGE_FAILURE_REMOVE_USER, data: { error: err } })
      return
    }
  })

  // Since we store the email information also in the sessions collection, we need to update it, too
  await Sessions.remove({ _id: sessionId }, (err) => {
    if (err) {
      res.json({ status: 516, message: MESSAGE_FAILURE_REMOVE_USER, data: { error: err } })
      return
    }
  })

  winston.log("info", `[ removeUser ] user ${userId} was removed`)
  return res.json({ status: 517, message: MESSAGE_SUCCESS_REMOVE_USER, data: { user } })
}
