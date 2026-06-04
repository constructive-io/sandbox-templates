-- Revert: schemas/myapp_logging_public/tables/audit_log_auth/columns/success/alterations/alt0000001557


ALTER TABLE myapp_logging_public.audit_log_auth 
  ALTER COLUMN success DROP NOT NULL;


