-- Verify: schemas/myapp_events_public/tables/app_events/table/partman


SELECT 1
FROM metaschema_public.partition
WHERE
  table_id = '019e8c61-52b4-7b36-8d3b-53f925594eec'::uuid;


