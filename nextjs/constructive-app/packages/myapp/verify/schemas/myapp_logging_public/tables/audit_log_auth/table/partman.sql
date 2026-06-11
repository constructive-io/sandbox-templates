-- Verify: schemas/myapp_logging_public/tables/audit_log_auth/table/partman


SELECT 1
FROM metaschema_public.partition
WHERE
  table_id = '019eaaf5-0111-711b-ab29-61002956e7d7'::uuid;


