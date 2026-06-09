-- Revert: schemas/myapp_logging_public/tables/audit_log_auth/columns/id/alterations/alt0000001594


ALTER TABLE myapp_logging_public.audit_log_auth 
  ALTER COLUMN id DROP NOT NULL;


