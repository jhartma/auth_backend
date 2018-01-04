"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resetDb_1 = require("../lib/resetDb");
const seed_1 = require("../lib/seed");
resetDb_1.resetDb().then(() => {
    seed_1.seedUsers().then((users) => {
        setTimeout(() => {
            console.log("Finished seeding data.");
            process.exit(0);
        }, 3000);
    });
});
//# sourceMappingURL=seed.js.map