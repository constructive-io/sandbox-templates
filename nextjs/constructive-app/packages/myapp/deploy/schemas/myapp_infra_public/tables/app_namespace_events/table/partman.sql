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
  ('b6817076-478f-4ab3-b0f8-3e31e3173ca0', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-8dd1-7ea4-b9c5-8758daeb1446', 'range', '019e8c61-8e00-7ff7-9486-aebb3eefa1c8', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

