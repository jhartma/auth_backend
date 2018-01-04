const fetch = require('fetch-cookie/node-fetch')(require('node-fetch'))

export async function forgotPassword({ email }) {
  return fetch("http://localhost/auth/forgot-password", {
    method: "post",
    credentials: "include",
    mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  }).then(response => {
    return response.json()
  })
}
