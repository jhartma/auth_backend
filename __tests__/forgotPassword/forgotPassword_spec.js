import { forgotPassword } from "../_helpers/forgotPassword"
import { forgotPasswordReset } from "../_helpers/forgotPasswordReset"
import { resetDb } from "../../dist/src/db/lib/resetDb"
import { seedUser } from "../../dist/src/db/lib/seed"

const username = "testuser"
const password = "testpassword"
const email = process.env.TEST_EMAIL

describe("Forgot Password @ready", () => {
  beforeAll(async () => {
    await resetDb()
    await seedUser({ username, password, email, city: "Leipzig", country: "Lala Land" })
  })

  test.only("should respond with a message that a token link was sent", async () => {
    const res = await forgotPassword({ email })
    expect(res.status).toEqual(200)
    expect(res.message).toEqual("Please check your email account, we sent you a link!")
  })

  test.only("should return a token of length 40 (only dev)", async () => {
    const res = await forgotPassword({ email })
    expect(res.data.token).toBeDefined()
    expect(res.data.token.length).toEqual(40)
  }, 5000)
})
