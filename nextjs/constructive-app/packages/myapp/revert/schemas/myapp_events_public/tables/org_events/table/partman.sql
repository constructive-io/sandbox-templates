-- Revert: schemas/myapp_events_public/tables/org_events/table/partman


DELETE FROM metaschema_public.partition
WHERE
  table_id = '019e917c-e9d6-72dc-b719-a6d31f8f097b'::uuid;


