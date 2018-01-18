import uuid from "uuid"
import { resetDb } from "../dist/src/db/lib/resetDb"
import { seedUser } from "../dist/src/db/lib/seed"
import { signin } from "./_helpers/signin"
import { signout } from "./_helpers/signout"

const timeout = 1000
let userId
const password = "asdSSf43@asdf"
let username
let user

beforeEach(async (done) => {
  username = uuid.v4()
  await resetDb()
  await seedUser({ username, password }).then((res) => { userId = res._id; done() })
})

afterEach(async (done) => {
  await resetDb()
  done()
})

describe("Remove user @ready", () => {
  describe("Results", () => {
    test.only("should return 200 when successfully logged out", async () => {
      await new Promise(resolve => setTimeout(resolve, timeout))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await signout()
      expect(updated.status).toEqual(200)
    }, 5000)

    test.only("should return 'You signed out' when successfully logged out", async () => {
      await new Promise(resolve => setTimeout(resolve, timeout))
      const s = await signin({ username, password }).catch((err) => console.log(err))
      const updated = await signout()
      expect(updated.message).toEqual("You signed out")
    }, 5000)
  })
})
