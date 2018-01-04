"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
async function clearDb(req, res) {
    if (!process.env.INTEGRATION) {
        res.json({ status: "error" });
        return;
    }
    await db_1.Accounts.remove({});
    await db_1.Sessions.remove({});
}
exports.clearDb = clearDb;
//# sourceMappingURL=clearDb.js.map