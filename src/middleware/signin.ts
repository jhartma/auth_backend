import * as express from "express"
import * as passport from "passport"
import { login } from "../lib/login"
import { AUTH_REDIRECT } from "../server/config"
import { MESSAGE_FAILURE_WRONG_CREDENTIALS, MESSAGE_SUCCESS_SIGNIN } from "../server/messages"

/**
 * Authenticates the user via Password middleware
 */
export async function signin(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) { throw new Error(err) }
    const cb = () => res.json({ status: 200, message: MESSAGE_SUCCESS_SIGNIN, data: { username: user.username, redirect: AUTH_REDIRECT } })
    login(user, req, res, next, cb)
  })(req, res, next)
}
