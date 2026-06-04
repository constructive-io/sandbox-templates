-- Revert: schemas/myapp_logging_public/tables/audit_log_auth/columns/id/column


ALTER TABLE myapp_logging_public.audit_log_auth 
  DROP COLUMN id RESTRICT;


