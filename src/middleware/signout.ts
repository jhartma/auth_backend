import * as express from "express"
import { MESSAGE_SUCCESS_SIGNOUT } from "../server/messages"

/**
 * Logs out the user
 */
export async function signout(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> {
  req.logout()
  res.json({ status: 200, message: MESSAGE_SUCCESS_SIGNOUT })
}
