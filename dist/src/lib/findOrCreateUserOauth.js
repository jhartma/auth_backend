"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid");
const db_1 = require("../db");
const logger_1 = require("../server/logger");
async function findOrCreateUserOauth({ service, profileId, displayName, email }) {
    let existingUser = null;
    switch (service) {
        case "facebook":
            existingUser = await db_1.Accounts.findOne({ $and: [
                    { deleted: false },
                    { "services.facebook.facebookId": profileId },
                ] }, (err, res) => {
                if (err) {
                    throw new Error(err);
                }
                return res;
            });
            break;
        case "google":
            existingUser = await db_1.Accounts.findOne({ $and: [
                    { deleted: false },
                    { "services.google.googleId": profileId },
                ] }, (err, res) => {
                if (err) {
                    throw new Error(err);
                }
                return res;
            });
            break;
        default:
            return null;
    }
    if (await existingUser) {
        return existingUser;
    }
    const user = {
        _id: uuid.v4(),
        emails: [{ address: email, verified: false }],
        services: {
            facebook: service === "facebook" ? { facebookId: profileId } : null,
            google: service === "google" ? { googleId: profileId } : null,
        },
        username: displayName,
    };
    return db_1.Accounts.create(user, (err) => {
        if (err) {
            logger_1.default.log("error", `Could't create user: ${err}`);
            throw new Error(err);
        }
    });
}
exports.findOrCreateUserOauth = findOrCreateUserOauth;
//# sourceMappingURL=findOrCreateUserOauth.js.map