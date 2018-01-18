import fetch from "node-fetch"

export async function updateEmail({ email, userId }) {
  return fetch(`http://localhost/auth/update-email?${email ? `email=${email}` : ""}${userId ? `&userId=${userId}` : ""}`, {
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