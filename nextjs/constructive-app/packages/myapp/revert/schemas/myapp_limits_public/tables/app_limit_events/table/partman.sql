-- Revert: schemas/myapp_limits_public/tables/app_limit_events/table/partman


DELETE FROM metaschema_public.partition
WHERE
  table_id = '019e8c61-4cd7-7c06-aacd-a6985e6cae3f'::uuid;


