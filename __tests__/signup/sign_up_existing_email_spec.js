import fetch from "node-fetch"
import { resetDb } from "../../dist/src/db/lib/resetDb"
import { seedUser } from "../../dist/src/db/lib/seed"

const username = "jhartma"
const email = process.env.TEST_EMAIL
const password = "asdSSf43@asdf"

describe("Existing Email @ready", () => {
  beforeAll((done) => {
    seedUser({ username, email, password }).then(() => done())
  }, 10 * 1000)

  test.only("should send an error message when the email already exists", async () => {
    expect.assertions(2)

    // Send request
    const res = fetch("https://localhost/auth/sign-up", {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: "anotherusername", email, password })
    })
    .catch((err) => console.log("ERR", err))
    .then(response => response.json())

    // Check response
    return res.then((response) => {
      expect(response.status).toEqual(504)
      expect(response.message).toEqual("Your email address already exists!")
    })
  }, 15 * 1000)
})
