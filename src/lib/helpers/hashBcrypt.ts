const bcrypt = require("bcrypt")

const saltRounds = 12

export async function hashBcrypt(text: string) {
  return new Promise((resolve) => {
    bcrypt.genSalt(saltRounds, (err: any, salt: any) => {
      return bcrypt.hash(text, salt, (err2: any, hash: any) => {
         resolve(hash)
      })
    })
  })
}
