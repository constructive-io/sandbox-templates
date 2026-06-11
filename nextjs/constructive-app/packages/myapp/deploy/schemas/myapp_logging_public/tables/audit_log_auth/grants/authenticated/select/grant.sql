-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table


GRANT SELECT ON myapp_logging_public.audit_log_auth TO authenticated;

