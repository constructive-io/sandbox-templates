-- Revert: schemas/myapp_logging_public/tables/audit_log_auth/policies/enable_row_level_security


ALTER TABLE myapp_logging_public.audit_log_auth 
  DISABLE ROW LEVEL SECURITY;


