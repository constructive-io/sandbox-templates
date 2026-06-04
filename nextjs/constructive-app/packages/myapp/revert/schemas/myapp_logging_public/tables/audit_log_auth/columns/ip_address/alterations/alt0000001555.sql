-- Revert: schemas/myapp_logging_public/tables/audit_log_auth/columns/ip_address/alterations/alt0000001555


ALTER TABLE myapp_logging_public.audit_log_auth 
  ALTER COLUMN ip_address DROP DEFAULT;


