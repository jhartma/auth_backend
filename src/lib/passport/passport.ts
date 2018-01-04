import * as passport from "passport"
import { findOrCreateUserOauth } from "../findOrCreateUserOauth"
import { verifyLoginCredentials } from "../helpers/verifyLoginCredentials"

import {
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  FACEBOOK_REDIRECT,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT,
} from "../../server/config"

const LocalStrategy = require("passport-local").Strategy

export function setupPassport(server: any) {
  passport.use("local", new LocalStrategy(
    (username: string, password: string, done: any) => {
      verifyLoginCredentials({ username, password }).then((res: any) => {
        if (!res.user) {
          return done(null, false)
        }
        return done(null, res.user)
      })
    },
  ))

  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    const GoogleStrategy = require("passport-google-oauth20").Strategy
    passport.use(new GoogleStrategy({
      callbackURL: GOOGLE_REDIRECT,
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }, (accessToken: any, refreshToken: any, profile: any, cb: any) => {
      findOrCreateUserOauth({
        displayName: profile.displayName,
        email: profile.emails[0].value,
        profileId: profile.id,
        service: "google",
      }).catch((err) => {
        throw new Error(err)
      }).then((user) => {
        cb(null, user)
      })
    }))
  }

  if (FACEBOOK_CLIENT_ID && FACEBOOK_CLIENT_SECRET) {
    const FacebookStragegy = require("passport-facebook")
    passport.use(new FacebookStragegy({
      callbackURL: FACEBOOK_REDIRECT,
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      profileFields: [ "id", "displayName", "photos", "email", "name" ],
    }, (accessToken: any, refreshToken: any, profile: any, cb: any) => {
      findOrCreateUserOauth({
        displayName: profile.displayName,
        profileId: profile.id,
        service: "facebook",
      }).catch((err: any) => {
        throw new Error(err)
      }).then((user: any) => {
        cb(null, user)
      })
    }))
  }

  passport.serializeUser((user: any, cb: any) => {
    cb(null, { _id: user._id, username: user.username, email: user.emails && user.emails[0] ? user.emails[0].address : null })
  })

  passport.deserializeUser((obj, cb) => {
    cb(null, obj)
  })

  server.use(passport.initialize())
  server.use(passport.session())
}
