-- Verify: schemas/myapp_logging_public/tables/audit_log_auth/table/partman


SELECT 1
FROM metaschema_public.partition
WHERE
  table_id = '019e917d-1942-72c9-bb43-47a0fe675632'::uuid;


