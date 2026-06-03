-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/columns/id/alterations/alt0000001545
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/columns/id/column


ALTER TABLE myapp_logging_public.audit_log_auth 
  ALTER COLUMN id SET DEFAULT uuidv7();

