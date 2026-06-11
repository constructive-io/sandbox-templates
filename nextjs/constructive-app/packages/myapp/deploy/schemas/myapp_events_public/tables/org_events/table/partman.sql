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
  ('83d9ef8c-0778-4a20-b390-dea1eb76aa64', '019eaaf4-a983-769d-8cf4-acfa48dc2f74', '019eaaf4-cf69-747b-a929-5fd9b5ae4673', 'range', '019eaaf4-cf98-7496-b332-c6cc291eba70', '1 month', '12 months', TRUE, 2, '{parent}_{bounds}')
ON CONFLICT (table_id) DO NOTHING;

