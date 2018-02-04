import fetch from "node-fetch"
import { resetDb } from "../../dist/src/db/lib/resetDb"
import { signup } from "../_helpers/signup"
import { seedUser } from "../../dist/src/db/lib/seed"

// Reset the database before the first test runs

beforeEach(async (done) => {
  await resetDb()
  done()
})

afterEach(async (done) => {
  await resetDb()
  done()
})

describe("Sign up test validations @ready", () => {
  test.only("should send an error message when the username is less than 6 characters", async () => {
    expect.assertions(2)

    const uname = "hansi"
    const mail = "mail@mail.mail"
    const pw = "asdf22"

    return signup({ username: uname, email: mail, password: pw }).then((response) => {
      expect(response.status).toEqual(514)
      expect(response.message).toEqual("Your username must have at least 6 characters!")
    }).catch((err) => console.log(err))
  }, 5 * 1000)

  test.only("should send an error message when the password is invalid", async () => {
    expect.assertions(2)

    const uname = "Christoph"
    const mail = "mail@mail.mail"
    const pw = "asdf22"

    return signup({ username: uname, email: mail, password: pw }).then((response) => {
      expect(response.status).toEqual(506)
      expect(response.message).toEqual("Password needs at least one capital letter and a special character!")
    }).catch((err) => console.log(err))
  }, 5 * 1000)

  test.only("should send an error message when the password is too short", async () => {
    expect.assertions(2)

    const uname = "Christoph"
    const mail = "mail@mail.mail2"
    const pw = "as"

    return signup({ username: uname, email: mail, password: pw }).then((response) => {
      expect(response.status).toEqual(505)
      expect(response.message).toEqual("A password needs at least 6 characters!")
    })
  })

  test.only("should send an error message when the email is invalid", async () => {
    expect.assertions(2)

    const uname = "Christoph"
    const mail = "mailmail"
    const pw = "aSsdSSf43@asdf"

    return signup({ username: uname, email: mail, password: pw }).then((response) => {
      expect(response.status).toEqual(510)
      expect(response.message).toEqual("This is not a valid email address!")
    })
  })

  test.only("should send an error message when the email already exists", async () => {
    expect.assertions(2)
    
    const username = "jhartma"
    const email = process.env.TEST_EMAIL
    const password = "asdSSf43@asdf"
    
    await resetDb()    
    await seedUser({ username, email, password })

    return signup({ username: "hasdfafe", email, password }).then((response) => {
      expect(response.status).toEqual(504)
      expect(response.message).toEqual("Your email address already exists!")
    }).catch((err) => console.log(err))
  }, 15 * 1000)

  test.only("should send an error message when the username already exists", async () => {
    expect.assertions(2)
    
    const username = "jhartma"
    const email = process.env.TEST_EMAIL
    const password = "asdSSf43@asdf"

    return signup({ username, email, password }).then((res) => {
      expect(res.status).toEqual(503)
      expect(res.message).toEqual("Your username already exists!")
    }).catch((err) => console.log(err))
  })
  
  test.only("should send an error message when the account limit is exceeded", async () => {
    await seedUser({ username: `user${Math.random}`, email: `test1@draaft.co`, password: "Asd§4dvadf3", city: "Leipzig", country: "Lala Land" })
    await seedUser({ username: `user${Math.random}`, email: `test2@draaft.co`, password: "Asd§4dvadf3", city: "Leipzig", country: "Lala Land" })
    await seedUser({ username: `user${Math.random}`, email: `test3@draaft.co`, password: "Asd§4dvadf3", city: "Leipzig", country: "Lala Land" })
    await seedUser({ username: `user${Math.random}`, email: `test4@draaft.co`, password: "Asd§4dvadf3", city: "Leipzig", country: "Lala Land" })
    await seedUser({ username: `user${Math.random}`, email: `test5@draaft.co`, password: "Asd§4dvadf3", city: "Leipzig", country: "Lala Land" })
    await seedUser({ username: `user${Math.random}`, email: `test6@draaft.co`, password: "Asd§4dvadf3", city: "Leipzig", country: "Lala Land" })
    await seedUser({ username: `user${Math.random}`, email: `test7@draaft.co`, password: "Asd§4dvadf3", city: "Leipzig", country: "Lala Land" })
    
    expect.assertions(2)

    return signup({ username: "Christoph", email: "test@draaft.co", password: "aSsdSSf43@asdf" }).then((response) => {
      expect(response.status).toEqual(518)
      expect(response.message).toEqual("Signing up has been stopped for the moment")
    })
  })
})
