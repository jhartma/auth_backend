import fetch from "node-fetch"

const timeout = 1000

test.only("should send 501 and message 'Sorry, your token is invalid!' when the validation token is invalid @ready", async () => {
  expect.assertions(2)
  await new Promise(resolve => setTimeout(resolve, timeout))  

  // Go to the confirmation link
  const confirmation = await fetch(encodeURI("http://localhost/auth/confirm-account/asdf/asdf"), { method: "GET" })
  .catch((err) => console.log("ERR", err))
  .then(response => {
    return response.json()
  })

  // Check response
  expect(confirmation.status).toEqual(501)
  expect(confirmation.message).toEqual("Sorry, your token is invalid!")
}, 3 * 60 * 1000)
