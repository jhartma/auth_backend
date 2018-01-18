import fetch from "node-fetch"

export async function resetPassword({ token, password, email }) {
  return fetch(`http://localhost/auth/reset-password`, {
    method: "POST",
    mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password, email })
  }).then(response => {
    return response.json()
  }).then((res) => res)
}
