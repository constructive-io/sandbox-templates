-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/alterations/alt0000001542
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table


ALTER TABLE myapp_logging_public.audit_log_auth 
  DISABLE ROW LEVEL SECURITY;

