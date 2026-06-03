-- Deploy: schemas/myapp_limits_public/tables/app_limit_events/table/partman
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/tables/app_limit_events/table


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
  ('d2973b6f-b55d-4576-8c7a-6f90d362e1c9', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-4cd7-7c06-aacd-a6985e6cae3f', 'range', '019e8c61-4cee-7c0a-95c1-82c04a521237', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

