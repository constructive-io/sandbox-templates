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
  ('5062998a-5413-4a16-9e1b-4728c37d13cd', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-52b4-7b36-8d3b-53f925594eec', 'range', '019e8c61-52d8-71ee-82be-7b88414821d6', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

