"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
async function sync() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('Connected, syncing schema (synchronize=true)');
        await data_source_1.AppDataSource.synchronize();
        console.log('Sync complete');
        process.exit(0);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}
sync();
