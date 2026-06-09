-- Verify: schemas/myapp_events_public/tables/org_events/table/partman


SELECT 1
FROM metaschema_public.partition
WHERE
  table_id = '019eaaf4-cf69-747b-a929-5fd9b5ae4673'::uuid;


