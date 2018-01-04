const fetch = require('fetch-cookie/node-fetch')(require('node-fetch'))

export async function forgotPasswordReset({ token, password, email }) {
  return fetch("http://localhost/auth/reset-password", {
    method: "post",
    credentials: "include",
    mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password, email }),
  }).then(response => {
    return response.json()
  })
}
