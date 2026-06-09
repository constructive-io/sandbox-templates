-- Revert: schemas/myapp_infra_public/tables/app_namespace_events/table/partman


DELETE FROM metaschema_public.partition
WHERE
  table_id = '019eaaf4-ed6b-707a-8b27-b7e715b55500'::uuid;


