-- Revert: schemas/myapp_infra_public/tables/app_namespace_events/table/partman


DELETE FROM metaschema_public.partition
WHERE
  table_id = '019e8c61-8dd1-7ea4-b9c5-8758daeb1446'::uuid;


