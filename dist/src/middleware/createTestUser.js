"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid");
const db_1 = require("../db");
const hashString_1 = require("../lib/helpers/hashString");
const logger_1 = require("../server/logger");
async function createTestUser({ body: { username, email, password } }, res) {
    if (!process.env.INTEGRATION) {
        res.json({ status: "error" });
        return;
    }
    if (!password || !email) {
        res.json({ status: 505, message: "No password or email!" });
        return;
    }
    const pw = password;
    const mail = email.toLowerCase();
    const encryptedPassword = await hashString_1.hashString(pw).catch((err) => {
        logger_1.default.log("error", `[ hashString ] Could't generate password: ${err}`);
        res.json({ error: { message: err } });
        return null;
    });
    const user = {
        _id: username === "jhartma" ? "1" : uuid.v4(),
        deleted: false,
        emails: [{ address: mail, verified: false }],
        services: {
            password: {
                hash: encryptedPassword,
                validated: true,
            },
        },
        username,
    };
    await db_1.Accounts.create(user, (err) => {
        if (err) {
            logger_1.default.log("error", `Could't create user: ${err}`);
            res.json({ error: { message: err } });
            return null;
        }
    });
    res.json({ status: "done", user: await db_1.Accounts.findOne({ _id: user._id }) });
}
exports.createTestUser = createTestUser;
//# sourceMappingURL=createTestUser.js.map