import fetch from "node-fetch"

export async function getUser({ userId }) {
  return fetch(`http://localhost/auth/${userId}`, {
    method: "GET",
    mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then(response => {
    return response.json()
  }).then((res) => res)
}
