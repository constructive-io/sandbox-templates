-- Revert: schemas/myapp_logging_public/tables/audit_log_auth/columns/event/alterations/alt0000001597


ALTER TABLE myapp_logging_public.audit_log_auth 
  ALTER COLUMN event DROP NOT NULL;


