-- Verify: schemas/myapp_infra_public/tables/app_namespace_events/table/partman


SELECT 1
FROM metaschema_public.partition
WHERE
  table_id = '019e917d-0681-7994-aafe-ce0599f61fc6'::uuid;


