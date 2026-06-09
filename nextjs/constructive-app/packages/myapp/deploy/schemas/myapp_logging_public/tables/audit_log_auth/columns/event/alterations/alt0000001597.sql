-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/columns/event/alterations/alt0000001597
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/columns/event/column


ALTER TABLE myapp_logging_public.audit_log_auth 
  ALTER COLUMN event SET NOT NULL;

