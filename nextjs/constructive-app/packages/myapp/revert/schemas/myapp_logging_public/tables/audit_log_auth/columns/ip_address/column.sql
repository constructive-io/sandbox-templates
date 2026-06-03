-- Revert: schemas/myapp_logging_public/tables/audit_log_auth/columns/ip_address/column


ALTER TABLE myapp_logging_public.audit_log_auth 
  DROP COLUMN ip_address RESTRICT;


