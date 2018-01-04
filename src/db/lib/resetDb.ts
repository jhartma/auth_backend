import { Accounts, db } from "../index"

export async function resetDb() {
  db.once("open", () => {
    Accounts.collection.remove({})
  })
}
