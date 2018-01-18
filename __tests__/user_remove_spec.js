import uuid from "uuid"
import { resetDb } from "../dist/src/db/lib/resetDb"
import { seedUser } from "../dist/src/db/lib/seed"
import { signin } from "./_helpers/signin"
import { removeUser } from "./_helpers/removeUser"

let userId
const password = "asdSSf43@asdf"
let username
let user

beforeEach(async (done) => {
  username = uuid.v4()
  await resetDb()
  await seedUser({ username, email: "mail@mail.com", password, city: "Leipzig", country: "Lala Land" })
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
    test.only("should return 509 and message 'Error: We cannot find a user with this email address. Please try again!' when user not found", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await removeUser({})
      expect(updated.status).toEqual(509)
      expect(updated.message).toEqual("Error: We cannot find a user with this email address. Please try again!")
    }, 5000)

    test.only("should return 515 and message 'Error: We cannot find this user!' when user not found", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await removeUser({ userId: "someId" })
      expect(updated.status).toEqual(515)
      expect(updated.message).toEqual("Error: We cannot find this user!")
    }, 5000)
  })

  describe("Results", () => {
    test.only("should return 517 when successfully deleted user", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await removeUser({ userId })
      expect(updated.status).toEqual(517)
    }, 5000)

    test.only("should return message 'Successfully removed user' when successfully deleted user", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await removeUser({ userId })
      expect(updated.message).toEqual("Successfully removed user")
    }, 5000)
  })
})
