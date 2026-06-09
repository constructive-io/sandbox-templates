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
  ('cfed672e-01a6-4b7b-a17e-29ad67ede711', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-ed6b-707a-8b27-b7e715b55500', 'range', '019eaaf4-ed99-73be-be53-dbfe1387c435', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

