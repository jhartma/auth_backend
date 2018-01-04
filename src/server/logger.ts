import * as winston from "winston"
import { ACCOUNTS_MONGO_STRING } from "./config"

// require("winston-mongodb") // eslint-disable-line no-unused-expressions

// const options = {
//   collection: "logs",
//   db: ACCOUNTS_MONGO_STRING,
//   tryReconnect: true,
// }

// // logger.winston(config.ACCOUNTS_MONGO_STRING)
// winston.add(winston.transports.MongoDB, options)

export default winston

/* Logging levels:
{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
*/
