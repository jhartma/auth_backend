import * as crypto from "crypto"

/**
 * Creates a random string for validation purposes
 * @return {String} [ a random string ]
 */
export function createValidationToken(): Promise<string> {
  return new Promise((resolve) => {
    crypto.randomBytes(20, (err: any, buf: any) => {
      resolve(buf.toString("hex"))
    })
  })
}
