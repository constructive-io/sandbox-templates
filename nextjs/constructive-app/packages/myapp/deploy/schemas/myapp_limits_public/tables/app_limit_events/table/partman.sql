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
  ('98118863-8b20-4e5a-92f6-45d4e5ce2202', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ac96-7a80-b129-8e64812de034', 'range', '019eaaf4-acaa-754e-b75c-602cf3c84190', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

