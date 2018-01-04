import * as bodyParser from "body-parser"
import * as cookieParser from "cookie-parser"
import * as express from "express"
import * as session from "express-session"
import * as passport from "passport"
import {
  ACCOUNTS_BACKEND_PORT,
  ACCOUNTS_MONGO_STRING,
  AUTH_REDIRECT,
  AUTH_VERSION,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "./config"

import {
  clearDb,
  confirmAccount,
  createTestUser,
  createUser,
  forgotPassword,
  getByUsername,
  getUser,
  removeUser,
  resetPassword,
  signin,
  signout,
  updateEmail,
  updatePassword,
  updateUsername,
} from "../middleware"

import { seedUsers } from "../db/lib/seed"
import { setupPassport } from "../lib/passport/passport"
import "./logger"
import rateLimiter from "./rateLimiter"

const app = express()
const MongoDBStore = require("connect-mongodb-session")(session)

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Initialize Session Cookies
app.use(session({
  cookie: { secure: false, httpOnly: false },
  resave: false,
  saveUninitialized: false,
  secret: "your secret",
  store: new MongoDBStore({ uri: ACCOUNTS_MONGO_STRING, collection: "sessions" }),
}))

// Initialize passport authentication
setupPassport(app)

// Send something when a user opens the root route
app.get("/", (req: express.Request, res: express.Response) => {
  res.send("This page does not exist")
})

// App Routes
app.get("/auth/sign-out", signout)
app.get("/auth/confirm-account/:token/:email", confirmAccount)
app.get("/internal/seedUsers", seedUsers)
app.post("/auth/forgot-password", forgotPassword)
app.post("/auth/reset-password", resetPassword)
if (process.env.NODE_ENV === "production") {
  app.post("/auth/sign-in", rateLimiter.prevent, signin)
} else {
  app.post("/auth/sign-in", signin)
}
app.post("/auth/sign-up", createUser)
app.post("/auth/update-email", updateEmail)
app.post("/auth/update-password", updatePassword)
app.post("/auth/update-username", updateUsername)
app.post("/auth/removeUser", removeUser)

// // Integration test routes
app.get("/internal/getByUsername/:username", getByUsername)
app.post("/internal/create-test-user", createTestUser)
app.post("/internal/clearDb", clearDb)

// External Auth Providers
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  app.get("/auth/google", passport.authenticate("google", { scope: [ "profile", "email" ] }))
  app.get("/auth/google/return", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
    res.writeHead(301, { Location: AUTH_REDIRECT })
    res.end()
  })
}

if (FACEBOOK_CLIENT_ID && FACEBOOK_CLIENT_SECRET) {
  app.get("/auth/facebook", passport.authenticate("facebook", { scope: [ "user_friends", "manage_pages" ] }))
  app.get("/auth/facebook/return", passport.authenticate("facebook", { failureRedirect: "/" }), (req, res) => {
    res.writeHead(301, { Location: AUTH_REDIRECT })
    res.end()
  })
}

// Get user information by userId
app.get("/auth/:userId", getUser)

// Start Server
app.listen(ACCOUNTS_BACKEND_PORT, () => {
  console.log(`Accounts app version ${AUTH_VERSION} listening on port ${ACCOUNTS_BACKEND_PORT}!`) // eslint-disable-line
})
