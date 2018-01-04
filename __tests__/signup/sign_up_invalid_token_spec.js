import fetch from "node-fetch"

test.only("should send an error message when the validation token is invalid @ready", async () => {
  expect.assertions(2)

  // Go to the confirmation link
  const confirmation = await fetch(encodeURI("https://localhost/confirm-account/1234"), { method: "GET" })
  .catch((err) => console.log("ERR", err))
  .then(response => response.json())

  // Check response
  expect(confirmation.status).toEqual(501)
  expect(confirmation.message).toEqual("Sorry, your token is invalid!")
}, 3 * 60 * 1000)
