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
  ('02d1e0b2-96cc-4784-a233-d913254ebc05', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-cf45-7a44-964c-0a3cdbd623c2', 'range', '019e917c-cf62-77b6-99a4-840968254c4a', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

