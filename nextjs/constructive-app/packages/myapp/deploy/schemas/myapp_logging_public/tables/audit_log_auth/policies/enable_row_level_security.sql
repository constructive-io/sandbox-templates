-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table


ALTER TABLE myapp_logging_public.audit_log_auth 
  ENABLE ROW LEVEL SECURITY;

