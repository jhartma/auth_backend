import fetch from "node-fetch"
import { resetDb } from "../../dist/src/db/lib/resetDb"
import { signup } from "../_helpers/signup"
// Reset the database before the first test runs

describe("Sign up test validations @ready", () => {
  test.only("should send an error message when the username is less than 6 characters", async () => {
    expect.assertions(2)

    const uname = "hansi"
    const mail = "mail@mail.mail"
    const pw = "asdf22"

    return signup({ username: uname, email: mail, password: pw }).then((response) => {
      expect(response.status).toEqual(505)
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
})
