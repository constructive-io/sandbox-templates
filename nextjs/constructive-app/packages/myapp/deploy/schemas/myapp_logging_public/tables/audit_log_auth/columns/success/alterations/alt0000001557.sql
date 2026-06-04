-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/columns/success/alterations/alt0000001557
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/columns/success/column


ALTER TABLE myapp_logging_public.audit_log_auth 
  ALTER COLUMN success SET NOT NULL;

