import uuid from "uuid"
import { resetDb } from "../dist/src/db/lib/resetDb"
import { seedUser } from "../dist/src/db/lib/seed"
import { signin } from "./_helpers/signin"
import { removeUser } from "./_helpers/removeUser"
import { resetPassword } from "./_helpers/resetPassword"
import { forgotPassword } from "./_helpers/forgotPassword"

let userId
const password = "asdSSf43@asdf"
const newPassword = `AA$sdf§dAS${Math.random()}`
const email = "mail@mail.com"
let username
let user

beforeEach(async (done) => {
  username = uuid.v4()
  await resetDb()
  await seedUser({ username, email, password, city: "Leipzig", country: "Lala Land" })
    .then((res) => {
      userId = res._id
      done()
    })
})

afterEach(async (done) => {
  await resetDb()
  done()
})

describe("Remove user @ready", () => {
  describe("Errors", () => {
    test.only("should return 501 and message 'Sorry, your token is invalid!' when no token is present", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await resetPassword({ password: newPassword, email })
      expect(updated.status).toEqual(501)
      expect(updated.message).toEqual("Sorry, your token is invalid!")
    }, 5000)

    test.only("should return 506 and message 'Password needs at least one capital letter and a special character!' when no password is present", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await resetPassword({ token: "asdf", email })
      expect(updated.status).toEqual(506)
      expect(updated.message).toEqual("Password needs at least one capital letter and a special character!")
    }, 5000)

    test.only("should return 509 and message 'Error: We cannot find a user with this email address. Please try again!' when no email is present", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await resetPassword({ token: "asdf", password: newPassword })
      expect(updated.status).toEqual(509)
      expect(updated.message).toEqual("Error: We cannot find a user with this email address. Please try again!")
    }, 5000)
  })

  describe("Results", () => {
    test.only("should save the new password", async () => {
      const { data: { token } } = await forgotPassword({ email })
      const res = await resetPassword({ email, token: token, password: "TestPW123&&" })
      expect(res.status).toEqual(200)
      expect(res.message).toEqual("You successfully resetted your password")
    }, 5000)
  
    test.only("should send an 501 error message if the token is invalid", async () => {
      const { data: { token } } = await forgotPassword({ email })
      const res = await resetPassword({ email, token: "something", password: "TestPW123&&" })
      expect(res.status).toEqual(501)
      expect(res.message).toEqual("Sorry, your token is invalid!")
    }, 5000)
  
    test.only("should send an 506 error message if the password is invalid", async () => {
      const { data: { token } } = await forgotPassword({ email })
      const res = await resetPassword({ email, token: "something", password: "dd" })
      expect(res.status).toEqual(506)
      expect(res.message).toEqual("Password needs at least one capital letter and a special character!")
    }, 5000)
  })
})
