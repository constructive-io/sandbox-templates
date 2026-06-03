-- Revert: schemas/myapp_logging_public/tables/audit_log_auth/columns/user_agent/alterations/alt0000001553


ALTER TABLE myapp_logging_public.audit_log_auth 
  ALTER COLUMN user_agent DROP DEFAULT;


