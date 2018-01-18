import { pathOr } from "ramda"
import { Accounts } from "../db"
import winston from "../server/logger"
import { MESSAGE_FAILURE_FIND_USER, MESSAGE_FAILURE_UNDEFINED } from "../server/messages"

export async function getUser(req: any, res: any): Promise<any> {
  const sessionUser = pathOr(undefined, [ "session", "passport", "user" ], req)
  const userId = sessionUser || pathOr(null, [ "params", "userId" ], req)

  const user: any = await Accounts.findOne({
    $and: [
      { _id: userId },
      { deleted: false },
      { $or: [
        { "services.password.validated": true },
        { "services.google.googleId": { $exists: true } },
        { "services.facebook.facebookId": { $exists: true } },
      ] },
    ],
  }, (err) => {
    if (err) {
      winston.log("error", `[ getUser ] An error occurred when fetching the user: ${userId}. Err: ${err}`)
      res.json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: err } })
    }
  })

  if (!user) {
    winston.log("info", `[ getUser ] Could not find user: ${userId}`)
    res.json({ status: 509, message: MESSAGE_FAILURE_FIND_USER })
    return
  }

  res.json({
    email: user.emails && user.emails[0].address,
    facebookId: user.services.facebook.facebookId,
    googleId: user.services.google.googleId,
    loggedIn: user.loggedIn,
    userId: user._id,
    username: user.username,
  })
}
