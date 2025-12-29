import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1682899200000 implements MigrationInterface {
  name = 'InitialSchema1682899200000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    await queryRunner.query(`
      CREATE TABLE "domains" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "host" text NOT NULL UNIQUE,
        "canonical_url" text,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "domain_id" uuid NOT NULL,
        "owner_id" uuid,
        "status" smallint NOT NULL DEFAULT 1,
        "note" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_projects_domain FOREIGN KEY (domain_id) REFERENCES domains(id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "project_settings" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "project_id" uuid NOT NULL UNIQUE,
        "default_country" char(2),
        "default_language" varchar(10),
        "check_cron" text,
        "check_window_start" time,
        "check_window_end" time,
        "check_frequency_minutes" integer,
        "settings" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_ps_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "keywords" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "project_id" uuid NOT NULL,
        "keyword" text NOT NULL,
        "normalized_keyword" text NOT NULL,
        "language" varchar(10),
        "search_volume" integer,
        "notes" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_kw_project_norm UNIQUE (project_id, normalized_keyword),
        CONSTRAINT fk_kw_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "competitors" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "project_id" uuid NOT NULL,
        "domain_id" uuid NOT NULL,
        "label" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_comp_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT fk_comp_domain FOREIGN KEY (domain_id) REFERENCES domains(id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "keyword_targets" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "keyword_id" uuid NOT NULL,
        "competitor_id" uuid,
        "target_url" text,
        "note" text,
        CONSTRAINT fk_kt_keyword FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE CASCADE,
        CONSTRAINT fk_kt_competitor FOREIGN KEY (competitor_id) REFERENCES competitors(id) ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "search_engines" (
        "id" smallint PRIMARY KEY,
        "name" text NOT NULL,
        "is_mobile" boolean NOT NULL DEFAULT false,
        "engine_region" text
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "rank_checks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "project_id" uuid NOT NULL,
        "scheduled_at" timestamptz NOT NULL,
        "started_at" timestamptz,
        "finished_at" timestamptz,
        "initiated_by" text,
        "status" smallint NOT NULL DEFAULT 0,
        "settings_snapshot" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_rc_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "rank_results" (
        "id" bigserial PRIMARY KEY,
        "rank_check_id" uuid NOT NULL,
        "project_id" uuid NOT NULL,
        "keyword_id" uuid NOT NULL,
        "competitor_id" uuid,
        "domain_id" uuid,
        "search_engine_id" smallint NOT NULL,
        "country" char(2),
        "language" varchar(10),
        "position" integer,
        "result_url" text,
        "result_title" text,
        "result_snippet" text,
        "is_featured_snippet" boolean DEFAULT false,
        "is_ad" boolean DEFAULT false,
        "raw_rank_data" jsonb,
        "checked_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_rr_check FOREIGN KEY (rank_check_id) REFERENCES rank_checks(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "serp_snapshots" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "rank_check_id" uuid NOT NULL,
        "keyword_id" uuid NOT NULL,
        "search_engine_id" smallint,
        "country" char(2),
        "language" varchar(10),
        "snapshot_json" jsonb NOT NULL,
        "snapshot_hash" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_ss_check FOREIGN KEY (rank_check_id) REFERENCES rank_checks(id) ON DELETE CASCADE,
        CONSTRAINT fk_ss_keyword FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_events" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "project_id" uuid,
        "actor" text,
        "event_type" text,
        "payload" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_ae_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // Indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_rank_results_proj_kw_se_country_ts ON rank_results (project_id, keyword_id, search_engine_id, country, checked_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_rank_results_kw_ts ON rank_results (keyword_id, checked_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_rank_results_proj_ts ON rank_results (project_id, checked_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_rank_results_pos_partial ON rank_results (position) WHERE position IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_rank_results_se ON rank_results (search_engine_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_rank_results_se`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_rank_results_pos_partial`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_rank_results_proj_ts`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_rank_results_kw_ts`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_rank_results_proj_kw_se_country_ts`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_events"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "serp_snapshots"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rank_results"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rank_checks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "search_engines"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "keyword_targets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "competitors"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "keywords"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "project_settings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "projects"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "domains"`);
  }
}
