import fetch from "node-fetch"

export async function updateUsername({ username, userId }) {
  return fetch(`http://localhost/auth/update-username?${username ? `username=${username}` : ""}${userId ? `&userId=${userId}` : ""}`, {
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