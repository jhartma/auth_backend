// For manual checks:
// curl -H "Content-Type: application/json" -X POST -d "{"username":"jhartma","password":"testtest"}" --cookie-jar -  http://localhost/auth/sign-in

import { resetDb } from "../dist/src/db/lib/resetDb"
import { seedUser } from "../dist/src/db/lib/seed"
import { signin } from "./_helpers/signin"

const password = "asdSSf43@asdf"
const username = "jhartma"

describe("Sign in @ready", () => {
  beforeAll(async (done) => {
    await resetDb()
    await seedUser({ username, password, city: "Leipzig", country: "Lala Land" })
    .then(() => {
      done()
    })
  })

  test.only("should return a positive message when successfully logged in", async () => {
    expect.assertions(1)
    // await new Promise(resolve => setTimeout(resolve, 1000))

    const res = await signin({ username, password }).catch((err) => console.log(err))
    expect({
      status: 200,
      message: "You signed in",
      data: {
        username: "jhartma",
        redirect: "/private",
      },
    }).toEqual(res)
  }, 5000)

  test.only("should return a negative response when username is false", async () => {
    expect.assertions(1)
    // await new Promise(resolve => setTimeout(resolve, 1 * 1000))
    const res = await signin({ username: "xxx", password })
    expect(res).toEqual({ status: 513,  message: "Your credentials are invalid!" })
  }, 5000)

  test.only("should return a negative response when the password is false", async () => {
    expect.assertions(1)
    // await new Promise(resolve => setTimeout(resolve, 3 * 1000))
    const res = await signin({ username, password: "asd" })
    expect(res).toEqual({ status: 513,  message: "Your credentials are invalid!" })
  }, 10000)
})
