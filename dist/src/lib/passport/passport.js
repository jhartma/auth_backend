"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passport = require("passport");
const findOrCreateUserOauth_1 = require("../findOrCreateUserOauth");
const verifyLoginCredentials_1 = require("../helpers/verifyLoginCredentials");
const config_1 = require("../../server/config");
const LocalStrategy = require("passport-local").Strategy;
function setupPassport(server) {
    passport.use("local", new LocalStrategy((username, password, done) => {
        verifyLoginCredentials_1.verifyLoginCredentials({ username, password }).then((res) => {
            if (!res.user) {
                return done(null, false);
            }
            return done(null, res.user);
        });
    }));
    if (config_1.GOOGLE_CLIENT_ID && config_1.GOOGLE_CLIENT_SECRET) {
        const GoogleStrategy = require("passport-google-oauth20").Strategy;
        passport.use(new GoogleStrategy({
            callbackURL: config_1.GOOGLE_REDIRECT,
            clientID: config_1.GOOGLE_CLIENT_ID,
            clientSecret: config_1.GOOGLE_CLIENT_SECRET,
        }, (accessToken, refreshToken, profile, cb) => {
            findOrCreateUserOauth_1.findOrCreateUserOauth({
                displayName: profile.displayName,
                email: profile.emails[0].value,
                profileId: profile.id,
                service: "google",
            }).catch((err) => {
                throw new Error(err);
            }).then((user) => {
                cb(null, user);
            });
        }));
    }
    if (config_1.FACEBOOK_CLIENT_ID && config_1.FACEBOOK_CLIENT_SECRET) {
        const FacebookStragegy = require("passport-facebook");
        passport.use(new FacebookStragegy({
            callbackURL: config_1.FACEBOOK_REDIRECT,
            clientID: config_1.FACEBOOK_CLIENT_ID,
            clientSecret: config_1.FACEBOOK_CLIENT_SECRET,
            profileFields: ["id", "displayName", "photos", "email", "name"],
        }, (accessToken, refreshToken, profile, cb) => {
            findOrCreateUserOauth_1.findOrCreateUserOauth({
                displayName: profile.displayName,
                profileId: profile.id,
                service: "facebook",
            }).catch((err) => {
                throw new Error(err);
            }).then((user) => {
                cb(null, user);
            });
        }));
    }
    passport.serializeUser((user, cb) => {
        cb(null, { _id: user._id, username: user.username, email: user.emails && user.emails[0] ? user.emails[0].address : null });
    });
    passport.deserializeUser((obj, cb) => {
        cb(null, obj);
    });
    server.use(passport.initialize());
    server.use(passport.session());
}
exports.setupPassport = setupPassport;
//# sourceMappingURL=passport.js.map