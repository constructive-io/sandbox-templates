-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/columns/ip_address/alterations/alt0000001556
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/columns/ip_address/column


COMMENT ON COLUMN myapp_logging_public.audit_log_auth.ip_address IS 'IP address of the client that initiated the auth event';

