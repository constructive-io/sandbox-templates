-- Verify: schemas/myapp_events_public/tables/app_events/table/partman


SELECT 1
FROM metaschema_public.partition
WHERE
  table_id = '019eaaf4-b2cc-71aa-8ab7-7f99bd08e3e9'::uuid;


