-- Revert: schemas/myapp_events_public/tables/app_events/table/partman


DELETE FROM metaschema_public.partition
WHERE
  table_id = '019e917c-cf45-7a44-964c-0a3cdbd623c2'::uuid;


