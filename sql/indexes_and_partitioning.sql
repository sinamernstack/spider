-- Indexes, partitioning helpers, and retention for rank_results

-- Example: create monthly partition for a specific month (YYYY-MM)
-- Replace dates as needed or script creation.

CREATE TABLE IF NOT EXISTS rank_results_2025_12 PARTITION OF rank_results
  FOR VALUES FROM ('2025-12-01 00:00:00+00') TO ('2026-01-01 00:00:00+00');

-- Partition creation helper function (creates monthly partition)
CREATE OR REPLACE FUNCTION create_monthly_rank_results_partition(p_year int, p_month int)
RETURNS void AS $$
DECLARE
  partition_name text;
  from_ts timestamptz;
  to_ts timestamptz;
BEGIN
  partition_name := format('rank_results_%s_%s', p_year, lpad(p_month::text,2,'0'));
  from_ts := to_timestamp(format('%s-%s-01','%s', lpad(p_month::text,2,'0')), 'YYYY-MM-DD')::timestamptz;
  to_ts := (from_ts + interval '1 month');
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF rank_results FOR VALUES FROM (%L) TO (%L)', partition_name, from_ts, to_ts);
END;
$$ LANGUAGE plpgsql;

-- Retention helper: drop partitions older than N months
CREATE OR REPLACE FUNCTION drop_rank_results_partitions_older_than(p_months int)
RETURNS void AS $$
DECLARE
  cutoff date := (date_trunc('month', now()) - (p_months || ' months')::interval)::date;
  r record;
BEGIN
  FOR r IN
    SELECT inhrelid::regclass::text as partname
    FROM pg_inherits
    JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
    JOIN pg_class child ON pg_inherits.inhrelid = child.oid
    WHERE parent.relname = 'rank_results'
  LOOP
    -- extract year_month from partition name if named as rank_results_YYYY_MM
    IF r.partname ~ 'rank_results_[0-9]{4}_[0-9]{2}' THEN
      PERFORM (
        CASE WHEN (
          (substring(r.partname from 'rank_results_([0-9]{4})_([0-9]{2})') ) IS NOT NULL
        ) THEN NULL ELSE NULL END
      );
      -- crude parse: get year and month
      -- safer approach: query pg_partition_range_values (PG14+) or store mapping elsewhere
    END IF;
    -- Note: implement your own logic for mapping partition name -> boundary and DROP as appropriate.
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Indexes on the partitioned parent table (will create partitioned indexes)
CREATE INDEX IF NOT EXISTS idx_rank_results_proj_kw_se_country_ts ON rank_results (project_id, keyword_id, search_engine_id, country, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_rank_results_kw_ts ON rank_results (keyword_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_rank_results_proj_ts ON rank_results (project_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_rank_results_pos_partial ON rank_results (position) WHERE position IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rank_results_se ON rank_results (search_engine_id);
CREATE INDEX IF NOT EXISTS idx_rank_results_kw_comp_ts ON rank_results (keyword_id, competitor_id, checked_at DESC);

-- JSONB GIN index for raw data search
CREATE INDEX IF NOT EXISTS idx_rank_results_raw_gin ON rank_results USING gin (raw_rank_data jsonb_path_ops);

-- Indexes for serp_snapshots
CREATE INDEX IF NOT EXISTS idx_serp_snapshots_kw_ct ON serp_snapshots (keyword_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_serp_snapshots_gin ON serp_snapshots USING gin (snapshot_json);

-- Indexes for scheduler/controls
CREATE INDEX IF NOT EXISTS idx_rank_checks_proj_sched ON rank_checks (project_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_keywords_proj_normkw ON keywords (project_id, normalized_keyword);
CREATE INDEX IF NOT EXISTS idx_competitors_proj_domain ON competitors (project_id, domain_id);

-- Notes:
-- 1) Create partitions regularly (e.g., once/month) using create_monthly_rank_results_partition.
-- 2) Consider creating partitions per project for very large single-customer volume (subpartitioning), or use time-based sharding at application level.
-- 3) Evaluate and tune indexes per query patterns; avoid very wide indexes if storage / write amplification becomes a problem.
