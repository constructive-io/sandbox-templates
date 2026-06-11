-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/columns/origin/alterations/alt0000001602
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/columns/origin/column


COMMENT ON COLUMN myapp_logging_public.audit_log_auth.origin IS E'Request origin (domain) where the auth event occurred';

