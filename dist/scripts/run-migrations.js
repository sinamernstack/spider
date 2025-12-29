"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
async function run() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('Running pending migrations...');
        const res = await data_source_1.AppDataSource.runMigrations();
        console.log('Migrations finished:', res.map(r => r.name));
        process.exit(0);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
