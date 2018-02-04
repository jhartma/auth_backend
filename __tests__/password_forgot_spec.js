import { forgotPassword } from "./_helpers/forgotPassword"
import { forgotPasswordReset } from "./_helpers/forgotPasswordReset"
import { resetDb } from "../dist/src/db/lib/resetDb"
import { seedUser } from "../dist/src/db/lib/seed"
import { clearMailbox } from "./_helpers/mail"

const username = "testuser"
const password = "testpassword"
const email = process.env.TEST_EMAIL

describe("Forgot Password @ready", () => {
  beforeAll(async () => {
    await clearMailbox()
    
    await resetDb()
    await seedUser({ username, password, email, city: "Leipzig", country: "Lala Land" })
  })

  afterAll(async () => {
    await clearMailbox()
  })

  describe("Errors", () => {
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

  describe("Results", () => {
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
})
