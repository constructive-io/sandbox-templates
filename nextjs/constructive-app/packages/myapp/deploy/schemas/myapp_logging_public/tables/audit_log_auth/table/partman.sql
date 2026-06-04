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
  ('b68c3192-ba55-4823-af21-48f3b7eedee5', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-1942-72c9-bb43-47a0fe675632', 'range', '019e917d-1a21-70a8-9014-7c5b6f3bac00', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

