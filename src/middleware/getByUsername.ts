import { Accounts } from "../db"
import winston from "../server/logger"
import { MESSAGE_FAILURE_FIND_USER, MESSAGE_FAILURE_UNDEFINED } from "../server/messages"

export async function getByUsername(req: any, res: any): Promise<any> {
  const username = req.params.username

  const user: any = await Accounts.findOne({
    $and: [
      { username },
      { deleted: false },
      { $or: [
        { "services.password.validated": true },
        { "services.google.googleId": { $exists: true } },
        { "services.facebook.facebookId": { $exists: true } },
      ] },
    ],
  }, (err) => {
    if (err) {
      winston.log("error", `[ getByUsername ] An error occurred when fetching the user: ${username}. Err: ${err}`)
      res.json({ status: 500, message: MESSAGE_FAILURE_UNDEFINED, data: { error: err } })
    }
  })

  if (!user) {
    winston.log("info", `[ getByUsername ] Could not find user: ${username}`)
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
