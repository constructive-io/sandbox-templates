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
  ('2b1a8861-12b1-4c6d-be51-4c2a2767cb12', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-60ed-7487-85c1-fc02b4eb19eb', 'range', '019e8c61-6111-7d56-95f2-689519adc25f', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

