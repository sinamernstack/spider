-- SEO Keyword Rank Tracker schema for PostgreSQL
-- Requires: pgcrypto (for gen_random_uuid) or adjust to uuid_generate_v4()

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Domains (normalized domain records)
CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host text NOT NULL UNIQUE,
  canonical_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Projects (one per tracked site / domain)
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain_id uuid NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
  owner_id uuid NULL,
  status smallint NOT NULL DEFAULT 1,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Per-project configuration
CREATE TABLE IF NOT EXISTS project_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  default_country char(2),
  default_language varchar(10),
  check_cron text,
  check_window_start time,
  check_window_end time,
  check_frequency_minutes integer,
  settings jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Canonical keywords per project
CREATE TABLE IF NOT EXISTS keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  normalized_keyword text NOT NULL,
  language varchar(10),
  search_volume integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, normalized_keyword)
);

-- Competitors associated with a project
CREATE TABLE IF NOT EXISTS competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  domain_id uuid NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, domain_id)
);

-- Optional mapping between a keyword and a competitor target (or main project when competitor_id IS NULL)
CREATE TABLE IF NOT EXISTS keyword_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id uuid NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  competitor_id uuid NULL REFERENCES competitors(id) ON DELETE SET NULL,
  target_url text,
  note text
);

-- Canonical search engines / device combos
CREATE TABLE IF NOT EXISTS search_engines (
  id smallint PRIMARY KEY,
  name text NOT NULL,
  is_mobile boolean NOT NULL DEFAULT false,
  engine_region text
);

-- Run/check metadata (one row per scheduled batch/check)
CREATE TABLE IF NOT EXISTS rank_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  started_at timestamptz,
  finished_at timestamptz,
  initiated_by text,
  status smallint NOT NULL DEFAULT 0,
  settings_snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Main time-series table: append-only, partitioned by checked_at for scale
CREATE TABLE IF NOT EXISTS rank_results (
  id bigserial NOT NULL,
  rank_check_id uuid NOT NULL REFERENCES rank_checks(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  keyword_id uuid NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  competitor_id uuid NULL REFERENCES competitors(id) ON DELETE SET NULL,
  domain_id uuid NULL REFERENCES domains(id) ON DELETE SET NULL,
  search_engine_id smallint NOT NULL REFERENCES search_engines(id),
  country char(2),
  language varchar(10),
  position integer,
  result_url text,
  result_title text,
  result_snippet text,
  is_featured_snippet boolean DEFAULT false,
  is_ad boolean DEFAULT false,
  raw_rank_data jsonb,
  checked_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
) PARTITION BY RANGE (checked_at);

-- SERP snapshots (full raw SERP payloads) for debugging / reprocessing
CREATE TABLE IF NOT EXISTS serp_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rank_check_id uuid NOT NULL REFERENCES rank_checks(id) ON DELETE CASCADE,
  keyword_id uuid NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  search_engine_id smallint,
  country char(2),
  language varchar(10),
  snapshot_json jsonb NOT NULL,
  snapshot_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Lightweight audit/events table
CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NULL REFERENCES projects(id) ON DELETE CASCADE,
  actor text,
  event_type text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful helper view (optional): latest rank per keyword per device/country
CREATE VIEW IF NOT EXISTS vw_latest_rank_per_keyword AS
SELECT DISTINCT ON (project_id, keyword_id, search_engine_id, country)
  project_id, keyword_id, search_engine_id, country, checked_at, position, result_url, domain_id
FROM rank_results
ORDER BY project_id, keyword_id, search_engine_id, country, checked_at DESC;
