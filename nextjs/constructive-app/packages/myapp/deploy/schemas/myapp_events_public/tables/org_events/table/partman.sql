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
  ('ba0cc903-a640-4729-b323-2e088961d03f', '019e8c61-4997-70bf-8a77-bbd439338daf', '019e8c61-6f7e-7b17-80e6-ddace807cb67', 'range', '019e8c61-6fac-715f-aa3c-00c9057c1acc', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

