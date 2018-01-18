import { Binary } from "bson";
import { Hash } from "crypto";

export interface Email {
  address: string
  verified: boolean
}

export interface Password {
  hash: any
  resetPasswordDate: any
  resetPasswordExpires: any
  resetPasswordToken: any
}

export interface Services {
  password: Password
}

export interface User {
  _id: string
  emails: Email[]
  services: Services
  username: string
}