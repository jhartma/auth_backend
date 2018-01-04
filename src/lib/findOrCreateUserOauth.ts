import * as uuid from "uuid"
import { Accounts } from "../db"
import winston from "../server/logger"

export async function findOrCreateUserOauth({ service, profileId, displayName, email }: any) {
  let existingUser = null

  switch (service) {
    case "facebook":
      existingUser = await Accounts.findOne({ $and: [
        { deleted: false },
        { "services.facebook.facebookId": profileId },
      ]}, (err: any, res: any) => {
        if (err) {
          throw new Error(err)
        }
        return res
      })
      break
    case "google":
      existingUser = await Accounts.findOne({ $and: [
        { deleted: false },
        { "services.google.googleId": profileId },
      ] }, (err: any, res: any) => {
        if (err) {
          throw new Error(err)
        }
        return res
      })
      break
    default:
      return null
  }

  if (await existingUser) {
    return existingUser
  }

  // If user does not exist yet, create a new one
  const user: any = {
    _id: uuid.v4(),
    emails: [{ address: email, verified: false }],
    services: {
      facebook: service === "facebook" ? { facebookId: profileId } : null,
      google: service === "google" ? { googleId: profileId } : null,
    },
    username: displayName,
  }

  return Accounts.create(user, (err: any) => {
    if (err) {
      winston.log("error", `Could't create user: ${err}`)
      throw new Error(err)
    }
  })
}
