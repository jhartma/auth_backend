// For manual checks:
// curl -H "Content-Type: application/json" -X POST -d "{"username":"jhartma","password":"testtest"}" --cookie-jar -  http://localhost/auth/sign-in
const fetch = require('fetch-cookie/node-fetch')(require('node-fetch'))

import { resetDb } from "../dist/src/db/lib/resetDb"
import { seedUser } from "../dist/src/db/lib/seed"
import { signin } from "./_helpers/signin"

const password = "asdSSf43@asdf"
const username = "jhartma"

describe("Remove user @dev", () => {
  beforeAll(async (done) => {
    await resetDb()
    await seedUser({ username, password, city: "Leipzig", country: "Lala Land" })
    .then(() => {
      done()
    })
  })


  test.only("should return a positive message when successfully deleted user", async () => {
    // expect.assertions(1)

    // return signin({ username, password }).then((r) => {
    //   return fetch("http://localhost/auth/removeUser", {
    //     method: "post",
    //     credentials: "include",
    //     mode: "cors",
    //   }).catch((err) => console.log(err))
    //   .then(response => {
    //     return response.json()
    //   }).then((res) => {
    //     console.log({ res })
    //     expect({
    //       status: 200,
    //       message: `Removed user`,
    //       data: {
    //         username: "jhartma",
    //       },
    //     }).toEqual(res)
    //   })
    // })
  }, 5000)
})
