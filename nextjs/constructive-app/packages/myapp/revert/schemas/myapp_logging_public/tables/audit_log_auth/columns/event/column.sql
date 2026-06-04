-- Revert: schemas/myapp_logging_public/tables/audit_log_auth/columns/event/column


ALTER TABLE myapp_logging_public.audit_log_auth 
  DROP COLUMN event RESTRICT;


