"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ExpressBrute = require("express-brute");
const config_1 = require("./config");
const MongoStore = require("express-brute-mongo");
const MongoClient = require("mongodb").MongoClient;
const store = new MongoStore((ready) => {
    MongoClient.connect(config_1.ACCOUNTS_MONGO_STRING, (err, client) => {
        const db = client.db("bruteforce");
        if (err) {
            throw err;
        }
        ready(db.collection("bruteforce-store"));
    });
});
const options = {
    freeRetries: 40,
    minWait: 500,
};
exports.default = new ExpressBrute(store, options);
//# sourceMappingURL=rateLimiter.js.map