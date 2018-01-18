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
  forgotPassword,
  getByUsername,
  getUser,
  removeUser,
  resetPassword,
  signin,
  signout,
  signup,
  updateEmail,
  updatePassword,
  updateUsername,
} from "../middleware"

import { seedUsers } from "../db/lib/seed"
import { setupPassport } from "../lib/passport/passport"
import "./logger"
import rateLimiter from "./rateLimiter"

const MongoDBStore = require("connect-mongodb-session")(session)

// Initialize express app
const app = express()

// Middleware
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
app.get("/auth/confirm-account/:token/:email", (req: any, res: any, next: any) => {
  confirmAccount(req, res, next).catch((err) => { throw new Error(err) })
})

app.get("/auth/sign-out", (req: any, res: any, next: any) => {
  signout(req, res, next).catch((err) => { throw new Error(err) })
})

app.get("/internal/seedUsers", (req: any, res: any, next: any) => {
  seedUsers(req, res, next).catch((err) => { throw new Error(err) })
})

app.post("/auth/forgot-password", (req: any, res: any, next: any) => {
  forgotPassword(req, res).catch((err) => { throw new Error(err) })
})

app.post("/auth/reset-password", (req: any, res: any, next: any) => {
  resetPassword(req, res).catch((err) => { throw new Error(err) })
})

// Use rate limiter only in production
if (process.env.NODE_ENV === "production") {
  app.post("/auth/sign-in", rateLimiter.prevent, (req: any, res: any, next: any) => {
    signin(req, res, next).catch((err) => { throw new Error(err) })
  })
} else {
  app.post("/auth/sign-in",  (req: any, res: any, next: any) => {
    signin(req, res, next).catch((err) => { throw new Error(err) })
  })
}

app.post("/auth/sign-up", (req: any, res: any, next: any) => {
  signup(req, res).catch((err: any) => { throw new Error(err) })
})

app.post("/auth/update-email", (req: any, res: any, next: any) => {
  updateEmail(req, res, next).catch((err) => { throw new Error(err) })
})

app.post("/auth/update-password", (req: any, res: any, next: any) => {
  updatePassword(req, res, next).catch((err) => { throw new Error(err) })
})

app.post("/auth/update-username", (req: any, res: any, next: any) => {
  updateUsername(req, res, next).catch((err) => { throw new Error(err) })
})

app.post("/auth/removeUser", (req: any, res: any, next: any) => {
  removeUser(req, res, next).catch((err) => { throw new Error(err) })
})

// // Integration test routes
app.get("/internal/getByUsername/:username", (req: any, res: any, next: any) => {
  getByUsername(req, res).catch((err) => { throw new Error(err) })
})

app.post("/internal/create-test-user", (req: any, res: any, next: any) => {
  createTestUser(req, res).catch((err) => { throw new Error(err) })
})

app.post("/internal/clearDb", (req: any, res: any, next: any) => {
  clearDb(req, res).catch((err) => { throw new Error(err) })
})

// External Auth Providers
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  app.get("/auth/google", passport.authenticate("google", { scope: [ "profile", "email" ] }))
  app.get("/auth/google/return", passport.authenticate("google", { failureRedirect: "/" }), (req: any, res: any) => {
    res.writeHead(301, { Location: AUTH_REDIRECT })
    res.end()
  })
}

if (FACEBOOK_CLIENT_ID && FACEBOOK_CLIENT_SECRET) {
  app.get("/auth/facebook", passport.authenticate("facebook", { scope: [ "user_friends", "manage_pages" ] }))
  app.get("/auth/facebook/return", passport.authenticate("facebook", { failureRedirect: "/" }), (req: any, res: any) => {
    res.writeHead(301, { Location: AUTH_REDIRECT })
    res.end()
  })
}

// Get user information by userId
app.get("/auth/:userId", (req: any, res: any, next: any) => {
  getUser(req, res).catch((err) => { throw new Error(err) })
})

// Start Server
app.listen(ACCOUNTS_BACKEND_PORT, () => {
  console.log(`Accounts app version ${AUTH_VERSION} listening on port ${ACCOUNTS_BACKEND_PORT}!`) // eslint-disable-line
})
