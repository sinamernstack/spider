"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedSearchEngines1682899300000 = void 0;
class SeedSearchEngines1682899300000 {
    async up(queryRunner) {
        await queryRunner.query(`INSERT INTO search_engines (id, name, is_mobile, engine_region) VALUES (1, 'google-desktop', false, 'google.com') ON CONFLICT DO NOTHING`);
        await queryRunner.query(`INSERT INTO search_engines (id, name, is_mobile, engine_region) VALUES (2, 'google-mobile', true, 'google.com') ON CONFLICT DO NOTHING`);
        await queryRunner.query(`INSERT INTO search_engines (id, name, is_mobile, engine_region) VALUES (3, 'bing-desktop', false, 'bing.com') ON CONFLICT DO NOTHING`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM search_engines WHERE id IN (1,2,3)`);
    }
}
exports.SeedSearchEngines1682899300000 = SeedSearchEngines1682899300000;
