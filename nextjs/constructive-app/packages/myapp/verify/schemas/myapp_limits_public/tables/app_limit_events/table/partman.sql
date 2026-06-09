-- Verify: schemas/myapp_limits_public/tables/app_limit_events/table/partman


SELECT 1
FROM metaschema_public.partition
WHERE
  table_id = '019eaaf4-ac96-7a80-b129-8e64812de034'::uuid;


