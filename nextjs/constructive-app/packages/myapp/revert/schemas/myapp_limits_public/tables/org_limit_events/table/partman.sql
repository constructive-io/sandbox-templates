-- Revert: schemas/myapp_limits_public/tables/org_limit_events/table/partman


DELETE FROM metaschema_public.partition
WHERE
  table_id = '019e8c61-60ed-7487-85c1-fc02b4eb19eb'::uuid;


