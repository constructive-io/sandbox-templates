-- Verify: schemas/myapp_logging_public/tables/audit_log_auth/table/partman


SELECT 1
FROM metaschema_public.partition
WHERE
  table_id = '019e8c61-a206-732d-a4ca-52ebc3829b4c'::uuid;


