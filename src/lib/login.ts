import * as express from "express"
import { AUTH_REDIRECT } from "../server/config"
import { MESSAGE_FAILURE_WRONG_CREDENTIALS, MESSAGE_SUCCESS_SIGNIN } from "../server/messages"

/**
 * Logs the user in with PassportJs
 * @param user The user object
 */
export async function login(user: any, req: express.Request, res: express.Response, next: express.NextFunction, cb: any): Promise<any> {
  if (user) {
    req.login(user, (error: any) => {
      if (error) {
        next(error)
      }
      // Successfully logged in
      cb()
    })
  } else {
    res.json({ status: 513, message: MESSAGE_FAILURE_WRONG_CREDENTIALS })
  }
}
