import * as mongoose from "mongoose"
import fetch from "node-fetch"
import { resetDb } from "../../dist/src/db/lib/resetDb"
import { seedUser } from "../../dist/src/db/lib/seed"
import { getEmailLink } from "../_helpers/mail"
import { signup } from "../_helpers/signup"

const username = "jimmie"
const email = process.env.TEST_EMAIL
const password = "asdSSf43@asdf"

describe("Sign up test @ready", () => {
  beforeAll(async () => {
    await resetDb()
  })
  afterAll(async () => {
    mongoose.disconnect()
  })

  test.only("should send a success message and an email link to verify the account", async () => {
    await new Promise(resolve => setTimeout(resolve, 1 * 1000))

    const signUp = await signup({ username, email, password }).then((response) => response)

    expect(signUp.status).toEqual(200)
    expect(signUp.data.username).toEqual(username)
    expect(signUp.data.userId).toBeDefined()

    // Wait for email and get the confirmation link
    // await new Promise(resolve => setTimeout(resolve, 1 * 1000))
    const link = await getEmailLink().catch((err) => console.log("ERR", err))
    expect(link).toEqual(expect.stringContaining("localhost/confirm-account"))

    // Go to the confirmation link
    await new Promise(resolve => setTimeout(resolve, 1 * 1000))
    const confirmation = await fetch(link, { method: "GET" })
      .catch((err) => console.log("ERR", err))
      .then(response2 => response2.json())

    // Check response   
    expect(confirmation.status).toEqual(200)
    expect(confirmation.message).toEqual("You successfully created your new account!")
    expect(confirmation.data.username).toEqual(username)
    expect(confirmation.data.userId).toBeDefined()
  }, 60000)
})
