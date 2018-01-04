"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const uuid = require("uuid");
const hashString_1 = require("../../lib/helpers/hashString");
const index_1 = require("../index");
function seedUser({ userId, username, email, password, city, country }) {
    return new Promise((resolve) => {
        hashString_1.hashString(password)
            .catch((error) => {
            throw new Error(error);
        })
            .then((hash) => {
            const user = new index_1.Accounts({
                _id: userId || uuid.v4(),
                emails: email ? [{ address: ramda_1.toLower(email), verified: false }] : null,
                profile: { city, country },
                services: { password: { hash, validated: true } },
                username,
            });
            user.save({ validateBeforeSave: false }, (err, res) => {
                if (!err) {
                    resolve(user);
                }
                if (err) {
                    throw new Error(err);
                }
            });
        });
    });
}
exports.seedUser = seedUser;
function seed() {
    console.log("Seeding accounts data ...");
    return Promise.all([
        seedUser({ userId: "1", username: "jhartma", email: process.env.TEST_EMAIL, password: "testtest" }),
        seedUser({ username: "michal", email: "hartmann.jrg@googlemail.com", password: "testtest" }),
        seedUser({ username: "hans", email: "test4@test.de", password: "testtest" }),
        seedUser({ username: "thomas", email: "test5@test.de", password: "testtest" }),
        seedUser({ username: "holger", email: "test6@test.de", password: "testtest" }),
        seedUser({ username: "gunther", email: "test7@test.de", password: "testtest" }),
        seedUser({ username: "martin", email: "test8@test.de", password: "testtest" }),
    ]).catch((err) => {
        throw new Error(err);
    });
}
exports.seed = seed;
async function reset() {
    index_1.Accounts.remove({});
    return index_1.Accounts.collection.remove({});
}
function seedUsers(req, res, next) {
    return reset().then(() => seed().then((users) => setTimeout(() => {
        console.log("Finished seeding accounts data.");
        if (res) {
            res.json(users);
        }
    }, 3000)));
}
exports.seedUsers = seedUsers;
//# sourceMappingURL=seed.js.map