"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
async function resetDb() {
    index_1.db.once("open", () => {
        index_1.Accounts.collection.remove({});
    });
}
exports.resetDb = resetDb;
//# sourceMappingURL=resetDb.js.map