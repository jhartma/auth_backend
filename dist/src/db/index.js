"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const mongoose = require("mongoose");
const config_1 = require("../server/config");
const options = {
    autoReconnect: true,
    reconnectInterval: 1000,
    reconnectTries: Number.MAX_VALUE,
    useMongoClient: true,
};
if (mongoose && mongoose.connection.readyState === 0) {
    mongoose.connect(config_1.ACCOUNTS_MONGO_STRING, options);
}
mongoose.Promise = Bluebird;
exports.db = mongoose.connection;
var accountsSchema_1 = require("./accountsSchema");
exports.Accounts = accountsSchema_1.Accounts;
var sessionsSchema_1 = require("./sessionsSchema");
exports.Sessions = sessionsSchema_1.Sessions;
exports.db.on("error", (e) => {
    if (e.message.code === "ETIMEDOUT") {
        console.log(e);
        mongoose.connect(config_1.ACCOUNTS_MONGO_STRING, options);
    }
    console.log(e);
});
//# sourceMappingURL=index.js.map