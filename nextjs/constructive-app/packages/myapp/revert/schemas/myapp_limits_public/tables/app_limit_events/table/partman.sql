-- Revert: schemas/myapp_limits_public/tables/app_limit_events/table/partman


DELETE FROM metaschema_public.partition
WHERE
  table_id = '019e917c-c9fe-7cb1-80a4-c789527aab6e'::uuid;


