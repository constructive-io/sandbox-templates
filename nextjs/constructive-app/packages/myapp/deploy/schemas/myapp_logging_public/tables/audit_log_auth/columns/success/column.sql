-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/columns/success/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table


ALTER TABLE myapp_logging_public.audit_log_auth 
  ADD COLUMN success bool;

