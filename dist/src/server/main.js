"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const config_1 = require("./config");
const middleware_1 = require("../middleware");
const seed_1 = require("../db/lib/seed");
const passport_1 = require("../lib/passport/passport");
require("./logger");
const rateLimiter_1 = require("./rateLimiter");
const MongoDBStore = require("connect-mongodb-session")(session);
const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    cookie: { secure: false, httpOnly: false },
    resave: false,
    saveUninitialized: false,
    secret: "your secret",
    store: new MongoDBStore({ uri: config_1.ACCOUNTS_MONGO_STRING, collection: "sessions" }),
}));
passport_1.setupPassport(app);
app.get("/", (req, res) => {
    res.send("This page does not exist");
});
app.get("/auth/confirm-account/:token/:email", (req, res, next) => {
    middleware_1.confirmAccount(req, res, next).catch((err) => { throw new Error(err); });
});
app.get("/auth/sign-out", (req, res, next) => {
    middleware_1.signout(req, res, next).catch((err) => { throw new Error(err); });
});
app.get("/internal/seedUsers", (req, res, next) => {
    seed_1.seedUsers(req, res, next).catch((err) => { throw new Error(err); });
});
app.post("/auth/forgot-password", (req, res, next) => {
    middleware_1.forgotPassword(req, res).catch((err) => { throw new Error(err); });
});
app.post("/auth/reset-password", (req, res, next) => {
    middleware_1.resetPassword(req, res).catch((err) => { throw new Error(err); });
});
if (process.env.NODE_ENV === "production") {
    app.post("/auth/sign-in", rateLimiter_1.default.prevent, (req, res, next) => {
        middleware_1.signin(req, res, next).catch((err) => { throw new Error(err); });
    });
}
else {
    app.post("/auth/sign-in", (req, res, next) => {
        middleware_1.signin(req, res, next).catch((err) => { throw new Error(err); });
    });
}
app.post("/auth/sign-up", (req, res, next) => {
    middleware_1.signup(req, res).catch((err) => { throw new Error(err); });
});
app.post("/auth/update-email", (req, res, next) => {
    middleware_1.updateEmail(req, res, next).catch((err) => { throw new Error(err); });
});
app.post("/auth/update-password", (req, res, next) => {
    middleware_1.updatePassword(req, res, next).catch((err) => { throw new Error(err); });
});
app.post("/auth/update-username", (req, res, next) => {
    middleware_1.updateUsername(req, res, next).catch((err) => { throw new Error(err); });
});
app.post("/auth/removeUser", (req, res, next) => {
    middleware_1.removeUser(req, res, next).catch((err) => { throw new Error(err); });
});
app.get("/internal/getByUsername/:username", (req, res, next) => {
    middleware_1.getByUsername(req, res).catch((err) => { throw new Error(err); });
});
app.post("/internal/create-test-user", (req, res, next) => {
    middleware_1.createTestUser(req, res).catch((err) => { throw new Error(err); });
});
app.post("/internal/clearDb", (req, res, next) => {
    middleware_1.clearDb(req, res).catch((err) => { throw new Error(err); });
});
if (config_1.GOOGLE_CLIENT_ID && config_1.GOOGLE_CLIENT_SECRET) {
    app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
    app.get("/auth/google/return", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
        res.writeHead(301, { Location: config_1.AUTH_REDIRECT });
        res.end();
    });
}
if (config_1.FACEBOOK_CLIENT_ID && config_1.FACEBOOK_CLIENT_SECRET) {
    app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["user_friends", "manage_pages"] }));
    app.get("/auth/facebook/return", passport.authenticate("facebook", { failureRedirect: "/" }), (req, res) => {
        res.writeHead(301, { Location: config_1.AUTH_REDIRECT });
        res.end();
    });
}
app.get("/auth/:userId", (req, res, next) => {
    middleware_1.getUser(req, res).catch((err) => { throw new Error(err); });
});
app.listen(config_1.ACCOUNTS_BACKEND_PORT, () => {
    console.log(`Accounts app version ${config_1.AUTH_VERSION} listening on port ${config_1.ACCOUNTS_BACKEND_PORT}!`);
    console.log(`Accounts app db connection: ${config_1.ACCOUNTS_MONGO_STRING}`);
    console.log(`Accounts app started in ${config_1.NODE_ENV} mode.`);
});
//# sourceMappingURL=main.js.map