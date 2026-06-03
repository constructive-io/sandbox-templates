-- Revert: schemas/myapp_logging_public/tables/audit_log_auth/columns/origin/column


ALTER TABLE myapp_logging_public.audit_log_auth 
  DROP COLUMN origin RESTRICT;


