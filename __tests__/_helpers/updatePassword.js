import fetch from "node-fetch"

export async function updatePassword({ password, userId }) {
  return fetch(`http://localhost/auth/update-password?${password ? `password=${password}` : ""}${userId ? `&userId=${userId}` : ""}`, {
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