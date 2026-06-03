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
  ('14768453-5616-4c13-b474-b14350cacc0a', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-a206-732d-a4ca-52ebc3829b4c', 'range', '019e8c61-a2f7-70cb-babd-2dfd41824b70', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

