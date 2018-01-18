import fetch from "node-fetch"

export async function signout() {
  return fetch("http://localhost/auth/sign-out", {
    method: "GET",
    credentials: "include",
  }).then(response => {
    return response.json()
  })
}
