-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/columns/id/alterations/alt0000001546
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/columns/id/column


COMMENT ON COLUMN myapp_logging_public.audit_log_auth.id IS E'Unique identifier for each audit event (uuidv7 provides temporal ordering)';

