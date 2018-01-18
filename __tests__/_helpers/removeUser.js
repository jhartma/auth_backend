import fetch from "node-fetch"

export async function removeUser({ userId }) {
  return fetch(`http://localhost/auth/removeUser?${userId ? `&userId=${userId}` : ""}`, {
    method: "POST",
    mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then(response => {
    return response.json()
  }).then((res) => res)
}
