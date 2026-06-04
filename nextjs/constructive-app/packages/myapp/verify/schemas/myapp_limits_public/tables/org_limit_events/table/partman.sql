-- Verify: schemas/myapp_limits_public/tables/org_limit_events/table/partman


SELECT 1
FROM metaschema_public.partition
WHERE
  table_id = '019e917c-dc74-7351-8a28-83bb3d74794f'::uuid;


