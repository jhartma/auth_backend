import fetch from "node-fetch"
import { resetDb } from "../dist/src/db/lib/resetDb"
import { seedUser } from "../dist/src/db/lib/seed"

describe("Get user fields @ready", () => {
  const userId = `userId_${Math.random()}`

  beforeEach(async (done) => {
    seedUser({ userId, username: "jhartma", password: "asdSSf43@asdf", city: "Leipzig", country: "Lala Land" })
    .then(() => {
      done()
    })
  })

  test.only("should return user data as json", async () => {
    expect.assertions(1)

    // Send request
    const res = fetch(`http://localhost/auth/${userId}`)
    .catch((err) => console.log("ERR", err))
    .then(response => {
      return response.json()
    })

    // Check response
    return res.then((response) => {
      expect(response).toEqual({
        userId,
        email: null,
        username: "jhartma",
        googleId: null,
        facebookId: null,
      })
    })
  }, 5000)
})
