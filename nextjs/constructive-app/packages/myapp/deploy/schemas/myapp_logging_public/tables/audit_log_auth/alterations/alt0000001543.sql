-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/alterations/alt0000001543
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table


COMMENT ON TABLE myapp_logging_public.audit_log_auth IS E'Partitioned append-only audit log of authentication events (sign-in, sign-up, password changes, etc.)';

