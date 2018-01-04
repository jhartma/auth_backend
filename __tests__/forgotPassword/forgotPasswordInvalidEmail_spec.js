import { forgotPassword } from "../_helpers/forgotPassword"
import { forgotPasswordReset } from "../_helpers/forgotPasswordReset"
import { resetDb } from "../../dist/src/db/lib/resetDb"
import { seedUser } from "../../dist/src/db/lib/seed"

const username = "testuser"
const password = "testpassword"
const email = process.env.TEST_EMAIL

describe("Forgot Password Invalid Email @ready", () => {
  beforeAll(async (done) => {
    await resetDb()
    await seedUser({ username, password, email, city: "Leipzig", country: "Lala Land" })
    .then(() => {
      done()
    })
  })

  test.only("should respond with 509 if the email is invalid", async () => {
    const res = await forgotPassword({ email: "invalid" })
    expect(res.status).toEqual(509)
  })

  test.only("should respond with an error message if the email is invalid", async () => {
    const res = await forgotPassword({ email: "invalid" })
    expect(res.message).toEqual("Error: We cannot find a user with this email address. Please try again!")
    expect(res.data).not.toBeDefined()
  }, 5000)

  test.only("should not send a token if the email is invalid (only dev)", async () => {
    const res = await forgotPassword({ email: "invalid" })
    expect(res.data).not.toBeDefined()
  }, 5000)
})
