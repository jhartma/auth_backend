import uuid from "uuid"
import { resetDb } from "../dist/src/db/lib/resetDb"
import { seedUser } from "../dist/src/db/lib/seed"
import { signin } from "./_helpers/signin"
import { updateUsername } from "./_helpers/updateUsername"

let userId
const password = "asdSSf43@asdf"
let username
let newUsername

beforeEach(async (done) => {
  username = uuid.v4()
  newUsername = uuid.v4()
  await resetDb()
  await seedUser({ username, password, city: "Leipzig", country: "Lala Land" })
    .then((res) => {
      userId = res._id
      done()
    })
})

afterEach(async (done) => {
  await resetDb()
  done()
})


describe("User: update username @ready", () => {
  describe("Errors", () => {
    test.only("should throw an error 500 and error 'Wrong session credentials' when the session has no userId", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))

      // Send request
      const updated = await updateUsername({ username: newUsername })

      expect(updated.status).toEqual(500)
      expect(updated.data.error).toEqual("Wrong session credentials")
    }, 5000)

    test.only("should throw an error 500 and error 'Wrong session credentials' when the username is missing", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))

      // Send request
      const updated = await updateUsername({ userId })

      expect(updated.status).toEqual(500)
      expect(updated.data.error).toEqual("Wrong session credentials")
    }, 5000)


    test.only("should throw an error 503 and error 'Your username already exists!' when the username exists", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))

      // Send request
      const updated = await updateUsername({ username, userId })

      expect(updated.status).toEqual(503)
      expect(updated.message).toEqual("Your username already exists!")
    }, 5000)
  })

  describe("Returns", () => {
    test.only("should return status 200 successfully updated the username", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))

      // Send request
      const updated = await updateUsername({ username: newUsername, userId })
      expect(updated.status).toEqual(200)
    }, 5000)

    test.only("should return a 'Successfully updated your account' when successfully updated the username", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))

      // Send request
      const updated = await updateUsername({ username: newUsername, userId })
      
      expect(updated.message).toEqual("Successfully updated your account")
    }, 5000)

    test.only("should return the userId when successfully updated the username", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))

      // Send request
      const updated = await updateUsername({ username: newUsername, userId })
      
      expect(updated.data.user._id).toEqual(userId)
    }, 5000)


    test.only("should return the new username when successfully updated the username", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))

      // Send request
      const updated = await updateUsername({ username: newUsername, userId })
      
      expect(updated.data.user.username).toEqual(newUsername)
    }, 5000)
  })
})