-- Revert: schemas/myapp_logging_public/tables/audit_log_auth/columns/origin/alterations/alt0000001601


ALTER TABLE myapp_logging_public.audit_log_auth 
  ALTER COLUMN origin DROP DEFAULT;


