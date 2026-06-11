-- Revert: schemas/myapp_logging_public/tables/audit_log_auth/table/partman


DELETE FROM metaschema_public.partition
WHERE
  table_id = '019eaaf5-0111-711b-ab29-61002956e7d7'::uuid;


