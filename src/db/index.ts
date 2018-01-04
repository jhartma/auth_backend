import * as Bluebird from "bluebird"
import * as mongoose from "mongoose"
import { ACCOUNTS_MONGO_STRING } from "../server/config"
import { AccountSchema } from "./accountsSchema"
import { SessionsSchema } from "./sessionsSchema"

// Prevent multiple connections - only connect when disconnected
if (mongoose && mongoose.connection.readyState === 0) {
  mongoose.connect(ACCOUNTS_MONGO_STRING, {
    autoReconnect: true,
    reconnectInterval: 1000,
    reconnectTries: Number.MAX_VALUE,
    useMongoClient: true,
  })
}

// Plugin custom promise library
(mongoose as any).Promise = Bluebird

// Export db
export const db = mongoose.connection

// Export collections
export { Accounts } from "./accountsSchema"
export { Sessions } from "./sessionsSchema"

// Reconnect on timeout
db.on("error", (e) => {
  if (e.message.code === "ETIMEDOUT") {
    console.log(e)
    mongoose.connect(ACCOUNTS_MONGO_STRING)
  }
  console.log(e)
})
