import uuid from "uuid"
import { resetDb } from "../dist/src/db/lib/resetDb"
import { seedUser } from "../dist/src/db/lib/seed"
import { signin } from "./_helpers/signin"
import { updatePassword } from "./_helpers/updatePassword"

const timeout = 500
let userId
let password = "asdSSf43@asdf"
let newPassword
let username
let email
let user

beforeEach(async (done) => {
  username = uuid.v4()
  newPassword = `A4sdf$332${Math.random()}`
  await resetDb()
  await seedUser({ username, email: "mail@mail.com", password, city: "Leipzig", country: "Lala Land" })
    .then((res) => {
      userId = res._id
      user = res
      done()
    })
})

afterEach(async (done) => {
  await resetDb()
  done()
})


describe("User: update password @ready", () => {
  describe("Errors", () => {
    test.only("should throw an error 500 and error 'Wrong session credentials' when the session has no userId", async () => {
      await new Promise(resolve => setTimeout(resolve, timeout))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updatePassword({ password: newPassword })
      expect(updated.status).toEqual(500)
      expect(updated.data.error).toEqual("Wrong session credentials")
    }, 5000)

    test.only("should return 505 and message 'A password needs at least 6 characters!' when the password is missing", async () => {
      await new Promise(resolve => setTimeout(resolve, timeout))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updatePassword({ userId })
      expect(updated.status).toEqual(505)
      expect(updated.message).toEqual("A password needs at least 6 characters!")
    }, 5000)

    test.only("should return 505 and message 'A password needs at least 6 characters!' when the password is missing", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updatePassword({ password: "12345", userId })
      expect(updated.status).toEqual(505)
      expect(updated.message).toEqual("A password needs at least 6 characters!")
    }, 5000)

    test.only("should return 506 and message 'Password needs at least one capital letter and a special character!' when the password has no special character", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updatePassword({ password: "pAss4345", userId })
      expect(updated.status).toEqual(506)
      expect(updated.message).toEqual("Password needs at least one capital letter and a special character!")
    }, 5000)

    test.only("should return 506 and message 'Password needs at least one capital letter and a special character!' when the password has no capital letter", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updatePassword({ password: "pass!4345", userId })
      expect(updated.status).toEqual(506)
      expect(updated.message).toEqual("Password needs at least one capital letter and a special character!")
    }, 5000)
  })

  describe("Returns", () => {
    test.only("should return status 200 successfully updated the password", async () => {
      await new Promise(resolve => setTimeout(resolve, timeout))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updatePassword({ password: newPassword, userId })
      expect(updated.status).toEqual(200)
    }, 5000)

    test.only("should return a 'Successfully updated your account' when successfully updated the password", async () => {
      await new Promise(resolve => setTimeout(resolve, timeout))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updatePassword({ password: newPassword, userId })
      expect(updated.message).toEqual("Successfully updated your account")
    }, 5000)

    test.only("should return the userId when successfully updated the password", async () => {
      await new Promise(resolve => setTimeout(resolve, timeout))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updatePassword({ password: newPassword, userId })
      expect(updated.data.user._id).toEqual(userId)
    }, 5000)
  })
})
