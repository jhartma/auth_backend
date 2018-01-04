const fetch = require('fetch-cookie/node-fetch')(require('node-fetch'))

export async function signin({ username, password }) {
  return fetch("http://localhost/auth/sign-in", {
    method: "post",
    credentials: "include",
    mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  }).then(response => {
    return response.json()
  })
}
