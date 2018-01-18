import uuid from "uuid"
import { resetDb } from "../dist/src/db/lib/resetDb"
import { seedUser } from "../dist/src/db/lib/seed"
import { signin } from "./_helpers/signin"
import { updateEmail } from "./_helpers/updateEmail"

let userId
const password = "asdSSf43@asdf"
let username
let email
let user

beforeEach(async (done) => {
  username = uuid.v4()
  email = `mail@test.com${Math.random()}`
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


describe("User: update email @ready", () => {
  describe("Errors", () => {
    test.only("should throw an error 500 and error 'Wrong session credentials' when the session has no userId", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updateEmail({ email })

      expect(updated.status).toEqual(500)
      expect(updated.data.error).toEqual("Wrong session credentials")
    }, 5000)

    test.only("should throw an error 500 and error 'Wrong session credentials' when the email is missing", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updateEmail({ userId })

      expect(updated.status).toEqual(500)
      expect(updated.data.error).toEqual("Wrong session credentials")
    }, 5000)

    test.only("should throw an error 504 and error 'Your email address already exists!' when the email address exists", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updateEmail({ email: user.emails[0].address, userId })
      expect(updated.status).toEqual(504)
      expect(updated.message).toEqual("Your email address already exists!")
    }, 5000)

    test.only("should throw an error 510 and error 'This is not a valid email address!' when the email address is invalid", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updateEmail({ email: "hallo", userId })
      expect(updated.status).toEqual(510)
      expect(updated.message).toEqual("This is not a valid email address!")
    }, 5000)
  })

  describe("Returns", () => {
    test.only("should return status 200 successfully updated the email address", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updateEmail({ email, userId })
      expect(updated.status).toEqual(200)
    }, 5000)

    test.only("should return a 'Successfully updated your account' when successfully updated the email address", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updateEmail({ email, userId })
      expect(updated.message).toEqual("Successfully updated your account")
    }, 5000)

    test.only("should return the userId when successfully updated the email address", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updateEmail({ email, userId })
      expect(updated.data.user._id).toEqual(userId)
    }, 5000)
    
    test.only("should return the new email when successfully updated the email address", async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updateEmail({ email, userId })
      expect(updated.data.user.emails[0].address).toEqual(email)
    }, 5000)

    test.only("also works when the user's email is currently undefined", async () => {
      const u = seedUser({ username, password, city: "Leipzig", country: "Lala Land" })
      await new Promise(resolve => setTimeout(resolve, 1000))      
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await updateEmail({ email, userId })
      expect(updated.status).toEqual(200)
      expect(updated.data.user._id).toEqual(userId)      
      expect(updated.data.user.emails[0].address).toEqual(email)
    }, 5000)      
  })
})
