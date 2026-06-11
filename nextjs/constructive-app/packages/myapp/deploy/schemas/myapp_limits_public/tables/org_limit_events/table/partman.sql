-- Deploy: schemas/myapp_limits_public/tables/org_limit_events/table/partman
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/tables/org_limit_events/table


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
  ('bfac7d57-15d9-46fc-ab88-7db059b5edde', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-c053-7d9a-8c18-9221a03d75aa', 'range', '019eaaf4-c074-7e49-a617-96aaf248566e', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

