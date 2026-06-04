-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/columns/success/alterations/alt0000001558
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/columns/success/column


COMMENT ON COLUMN myapp_logging_public.audit_log_auth.success IS 'Whether the authentication attempt succeeded';

