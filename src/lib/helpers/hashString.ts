// https://stormpath.com/blog/secure-password-hashing-in-node-with-argon2
// https://hackernoon.com/your-node-js-authentication-tutorial-is-wrong-f1a3bf831a46
const securePassword = require("secure-password")

/**
* Takes a password string and encrypts it with argon2
* @param  {String} password [ user password that is going to be encrypted ]
* @return {String}          [ the encrypted password ]
*/
export function hashString(password: string) {
  return new Promise((resolve, reject) => {
    const pwd = securePassword()
    const passwordBuffer = Buffer.from(password)
    return pwd.hash(passwordBuffer, (err: any, hash: any) => {
      if (err) {
        reject(err)
      }
      resolve(hash)
    })
  })
}
