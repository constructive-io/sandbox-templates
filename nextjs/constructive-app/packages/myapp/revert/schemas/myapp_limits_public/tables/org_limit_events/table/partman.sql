-- Revert: schemas/myapp_limits_public/tables/org_limit_events/table/partman


DELETE FROM metaschema_public.partition
WHERE
  table_id = '019eaaf4-c053-7d9a-8c18-9221a03d75aa'::uuid;


