-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/columns/user_agent/alterations/alt0000001604
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/columns/user_agent/column


COMMENT ON COLUMN myapp_logging_public.audit_log_auth.user_agent IS E'Browser or client user-agent string from the request';

