import { forgotPassword } from "../_helpers/forgotPassword"
import { forgotPasswordReset } from "../_helpers/forgotPasswordReset"
import { resetDb } from "../../dist/src/db/lib/resetDb"
import { seedUser } from "../../dist/src/db/lib/seed"

const username = "testuser"
const password = "testpassword"
const email = process.env.TEST_EMAIL

describe("Forgot Password Reset @ready", () => {
  beforeAll(async (done) => {
    await resetDb()
    await seedUser({ username, password, email, city: "Leipzig", country: "Lala Land" })
    .then(() => {
      done()
    })
  })

  test.only("should save the new password", async () => {
    const { data: { token } } = await forgotPassword({ email })
    const res = await forgotPasswordReset({ email, token: token, password: "TestPW123&&" })
    expect(res.status).toEqual(200)
    expect(res.message).toEqual("You successfully resetted your password")
  }, 5000)

  test.only("should send an 501 error message if the token is invalid", async () => {
    const { data: { token } } = await forgotPassword({ email })
    const res = await forgotPasswordReset({ email, token: "something", password: "TestPW123&&" })
    expect(res.status).toEqual(501)
    expect(res.message).toEqual("Sorry, your token is invalid!")
  }, 5000)

  test.only("should send an 506 error message if the password is invalid", async () => {
    const { data: { token } } = await forgotPassword({ email })
    const res = await forgotPasswordReset({ email, token: "something", password: "dd" })
    expect(res.status).toEqual(506)
    expect(res.message).toEqual("Password needs at least one capital letter and a special character!")
  }, 5000)
})
