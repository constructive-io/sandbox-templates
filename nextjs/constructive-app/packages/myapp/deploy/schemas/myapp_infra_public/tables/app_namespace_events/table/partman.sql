-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/table/partman
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/tables/app_namespace_events/table


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
  ('bf1e314c-1d4f-4f6d-bf72-4c9bd4dcc98a', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917d-0681-7994-aafe-ce0599f61fc6', 'range', '019e917d-06af-7692-b467-8362e289f59a', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

