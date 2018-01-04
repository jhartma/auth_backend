import fetch from "node-fetch"
import { resetDb } from "../../dist/src/db/lib/resetDb"
import { seedUser } from "../../dist/src/db/lib/seed"

const username = "jhartma"
const email = process.env.TEST_EMAIL
const password = "asdSSf43@asdf"

describe("Signup with existing username @ready", () => {
  beforeAll(async (done) => {
    await seedUser({ username, password })
    .then(() => {
      done()
    })
  })

  test.only("should send an error message when the username already exists", async () => {
    expect.assertions(2)

    // Send request
    const res = await fetch("http://localhost/auth/sign-up", {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password })
    })
    .catch((err) => console.log("ERR", err))
    .then(response => response.json())

    // Check response
    expect(res.status).toEqual(503)
    expect(res.message).toEqual("Your username already exists!")
  })
})
