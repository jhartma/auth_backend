import uuid from "uuid"
import { resetDb } from "../dist/src/db/lib/resetDb"
import { seedUser } from "../dist/src/db/lib/seed"
import { signin } from "./_helpers/signin"
import { getUser } from "./_helpers/getUser"

const password = "asdSSf43@asdf"
const email = "mail@mail.com"
const timeout = 700
let username
let user

beforeEach(async (done) => {
  username = uuid.v4()
  await resetDb()
  await seedUser({ username, email, password, city: "Leipzig", country: "Lala Land" })
    .then((res) => {
      user = res
      done()
    })
})

afterEach(async (done) => {
  await resetDb()
  done()
})

describe("Get user @ready", () => {
  describe("Errors", () => {
    test.only("should return 509 and message 'Error: We cannot find a user with this email address. Please try again!' when userId is given", async () => {
      await new Promise(resolve => setTimeout(resolve, timeout))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await getUser({})
      expect(updated.status).toEqual(509)
      expect(updated.message).toEqual("Error: We cannot find a user with this email address. Please try again!")
    }, 5000)
  })

  describe("Results", () => {
    test.only("should return the user's _id", async () => {
      await new Promise(resolve => setTimeout(resolve, timeout))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await getUser({ userId: user._id })
      expect(updated.userId).toEqual(user._id)
    }, 5000)
    
    test.only("should return the user's email address", async () => {
      await new Promise(resolve => setTimeout(resolve, timeout))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await getUser({ userId: user._id })
      expect(updated.email).toEqual(email)
    }, 5000)

    test.only("should return the user's username", async () => {
      await new Promise(resolve => setTimeout(resolve, timeout))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await getUser({ userId: user._id })
      expect(updated.username).toEqual(user.username)
    }, 5000)
  })
})
