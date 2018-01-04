import * as ExpressBrute from "express-brute"
import { ACCOUNTS_MONGO_STRING } from "./config"

const MongoStore = require("express-brute-mongo")
const MongoClient = require("mongodb").MongoClient

const store = new MongoStore((ready: any) => {
  MongoClient.connect(ACCOUNTS_MONGO_STRING, (err: any, client: any) => {
    const db = client.db("bruteforce")
    if (err) {
      throw err
    }
    ready(db.collection("bruteforce-store"))
  })
})

const options = {
  freeRetries: 40,
  minWait: 500,
}
export default new ExpressBrute(store, options)
