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
  ('c51f3276-1c59-4d39-9f1d-71b344ddfbbc', '019e917c-c6ea-7cbc-8453-5f56622546a6', '019e917c-c9fe-7cb1-80a4-c789527aab6e', 'range', '019e917c-ca12-7544-b948-febfa2dc210f', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

