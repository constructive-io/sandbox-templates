-- Deploy: schemas/myapp_events_public/tables/org_events/table/partman
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/tables/org_events/table


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
  ('b7bf1356-1005-41f2-9c57-5c6a6eef75b8', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-e9d6-72dc-b719-a6d31f8f097b', 'range', '019e917c-e9f9-7c0b-b9f2-7cdeb8b26cb3', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

