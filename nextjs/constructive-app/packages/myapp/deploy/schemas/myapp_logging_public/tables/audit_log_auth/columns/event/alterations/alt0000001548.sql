-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/columns/event/alterations/alt0000001548
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/columns/event/column


COMMENT ON COLUMN myapp_logging_public.audit_log_auth.event IS E'Type of authentication event (e.g. sign_in, sign_up, password_change, verify_email)';

