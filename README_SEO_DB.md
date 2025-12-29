<!-- @format -->

SEO Keyword Rank Tracker — Database Schema

What I created

- `sql/schema.sql` — full CREATE TABLE statements for domains, projects, keywords, competitors, rank_checks, partitioned rank_results (time-series), serp_snapshots, and support tables.
- `sql/indexes_and_partitioning.sql` — recommended indexes, partition helper functions, example monthly partition, and notes on retention.

Next steps to deploy

1. Initialize a PostgreSQL instance (v13+ recommended). Enable `pgcrypto` if you want `gen_random_uuid()`.

2. Run the schema and index files:

```sql
-- from psql
\i path/to/sql/schema.sql
\i path/to/sql/indexes_and_partitioning.sql
```

3. Create monthly partitions (example):

```sql
SELECT create_monthly_rank_results_partition(2025, 12);
```

4. Automate partition creation and retention using a small scheduler (cron, pg_cron, or application job). Consider archiving old partitions to S3 (Parquet) for long-term storage.

Why this design

- `rank_results` is partitioned by `checked_at` for high insert throughput and efficient time-range queries.
- Structured columns (position, result_url, flags) provide fast analytics; `raw_rank_data` and `serp_snapshots` preserve full fidelity for debugging and reprocessing.
- Composite indexes target the most common analytics queries: per-project + per-keyword + device + country + time-range.
- UUIDs for stable references (projects, keywords, checks) and `bigserial` for the append-only time-series ID balance distributed writes vs local insert speed.
- Schema is SaaS-ready: `owner_id` in `projects` supports multi-tenant and `project_id` scoping is enforced via keys and recommended row-level-security in production.

If you want, I can now:

- generate a full set of CREATE INDEX statements tuned to your expected query patterns, or
- provide a sample retention/archival script that exports old partitions to S3 in Parquet format, or
- convert SQL into a migration (Flyway / Liquibase) files. Which do you want next?
