import * as express from "express"

import { Accounts, Sessions } from "../db"

/**
 * Clears the entire database when in INTEGRATION mode
 */
export async function clearDb(req: express.Request, res: express.Response) {
  if (!process.env.INTEGRATION) {
    res.json({ status: "error" })
    return
  }

  await Accounts.remove({})
  await Sessions.remove({})
}
