"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resetDb_1 = require("../lib/resetDb");
resetDb_1.resetDb().then(() => {
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});
//# sourceMappingURL=resetDb.js.map