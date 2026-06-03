-- Verify: schemas/myapp_events_public/tables/org_events/table/partman


SELECT 1
FROM metaschema_public.partition
WHERE
  table_id = '019e8c61-6f7e-7b17-80e6-ddace807cb67'::uuid;


