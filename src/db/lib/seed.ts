import { toLower } from "ramda"
import * as  uuid from "uuid"
import { hashString } from "../../lib/helpers/hashString"
import { Accounts } from "../index"
import { resetDb } from "./resetDb"

/**
 * Creates a simple user in the db for seed data
 * @param  {String}  username [description]
 * @param  {Stirng}  email    [description]
 * @param  {String}  password [description]
 * @return {Promise}          [description]
 */

export function seedUser({ userId, username, email, password, city, country }: any) {
  return new Promise((resolve) => {
    hashString(password)
      .catch((error) => {
        throw new Error(error)
      })
      .then((hash) => {
        const user = new Accounts({
          // _id: username === "jhartma" ? "1" : uuid.v4(),
          _id: userId || uuid.v4(),
          emails: email ? [{ address: toLower(email), verified: false }] : null,
          profile: { city, country },
          services: { password: { hash, validated: true } },
          username,
        })
        user.save({ validateBeforeSave: false }, (err, res) => {
          if (!err) {
            resolve(user)
          }
          if (err) {
            throw new Error(err)
          }
        })
      })
  })
}

export function seed() {
  console.log("Seeding accounts data ...") // eslint-disable-line
  return Promise.all([
    seedUser({ userId: "1", username: "jhartma", email: process.env.TEST_EMAIL, password: "testtest" }),
    seedUser({ username: "michal", email: "hartmann.jrg@googlemail.com", password: "testtest" }),
    seedUser({ username: "hans", email: "test4@test.de", password: "testtest" }),
    seedUser({ username: "thomas", email: "test5@test.de", password: "testtest" }),
    seedUser({ username: "holger", email: "test6@test.de", password: "testtest" }),
    seedUser({ username: "gunther", email: "test7@test.de", password: "testtest" }),
    seedUser({ username: "martin", email: "test8@test.de", password: "testtest" }),
  ]).catch((err) => {
    throw new Error(err)
  })
}

async function reset() {
  Accounts.remove({})
  return Accounts.collection.remove({})
}

// This function can be called from another server
export function seedUsers(req: any, res: any, next: any) {
  return reset().then(() => seed().then((users) => setTimeout(() => {
    console.log("Finished seeding accounts data.") // eslint-disable-line
    if (res) {
      res.json(users)
    }
  }, 3000)))
}
