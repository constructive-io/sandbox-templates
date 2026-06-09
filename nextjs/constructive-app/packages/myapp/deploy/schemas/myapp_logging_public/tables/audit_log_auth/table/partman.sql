-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/table/partman
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table


INSERT INTO metaschema_public.partition (
  id,
  database_id,
  table_id,
  strategy,
  partition_key_id,
  interval,
  retention,
  retention_keep_table,
  premake,
  naming_pattern
)
VALUES
  ('515a5fe4-5e2f-4c8e-accf-6b239b5a0b18', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf5-0111-711b-ab29-61002956e7d7', 'range', '019eaaf5-01f0-7861-a5ae-ee5136621f9b', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

