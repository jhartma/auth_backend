// For manual checks:
// curl -H "Content-Type: application/json" -X POST -d "{"username":"jhartma","password":"testtest"}" --cookie-jar -  http://localhost/auth/sign-in
import uuid from "uuid"
import { resetDb } from "../dist/src/db/lib/resetDb"
import { seedUser } from "../dist/src/db/lib/seed"
import { signin } from "./_helpers/signin"

const password = "asdSSf43@asdf"
const timeout = 500
let username

describe("Sign in @ready", () => {
  beforeAll(async (done) => {
    username = `test${Math.random()}`
    await resetDb()
    await seedUser({ username, password, city: "Leipzig", country: "Lala Land" })
    .then(() => {
      done()
    })
  })

  test.only("should return a positive message when successfully logged in", async () => {
    expect.assertions(1)
    await new Promise(resolve => setTimeout(resolve, timeout))

    const res = await signin({ username, password }).catch((err) => console.log(err))
    const expected = {
      status: 200,
      message: "You signed in",
      data: {
        username,
        redirect: "/private",
      },
    }
    
    expect(expected).toEqual(res)
  }, 5000)

  test.only("should return 513 and 'Your credentials are invalid!' when username is false", async () => {
    expect.assertions(1)
    await new Promise(resolve => setTimeout(resolve, timeout))
    const res = await signin({ username: "xxx", password })
    expect(res).toEqual({ status: 513,  message: "Your credentials are invalid!" })
  }, 5000)

  test.only("should return 514 nad 'Your credentials are invalid!' when the password is false", async () => {
    expect.assertions(1)
    await new Promise(resolve => setTimeout(resolve, timeout))
    const res = await signin({ username, password: "asd" })
    expect(res).toEqual({ status: 513,  message: "Your credentials are invalid!" })
  }, 10000)
})
