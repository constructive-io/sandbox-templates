-- Deploy: schemas/myapp_events_public/tables/app_events/table/partman
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/tables/app_events/table


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
  ('6dab0912-5e39-4ed6-9768-aa8b06850fd3', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-b2cc-71aa-8ab7-7f99bd08e3e9', 'range', '019eaaf4-b2eb-7f78-8f74-ba8525afc8dc', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

