import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedSearchEngines1682899300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO search_engines (id, name, is_mobile, engine_region) VALUES (1, 'google-desktop', false, 'google.com') ON CONFLICT DO NOTHING`);
    await queryRunner.query(`INSERT INTO search_engines (id, name, is_mobile, engine_region) VALUES (2, 'google-mobile', true, 'google.com') ON CONFLICT DO NOTHING`);
    await queryRunner.query(`INSERT INTO search_engines (id, name, is_mobile, engine_region) VALUES (3, 'bing-desktop', false, 'bing.com') ON CONFLICT DO NOTHING`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM search_engines WHERE id IN (1,2,3)`);
  }
}
