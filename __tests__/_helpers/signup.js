const fetch = require("fetch-cookie")(require("node-fetch"))

export function signup({ username, password, email }) {
  return fetch("https://localhost/auth/sign-up", {
    method: "POST",
    mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password })
  })
  .catch((err) => console.log("ERR", err))
  .then(response => response.json())
}
