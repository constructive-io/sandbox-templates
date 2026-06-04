-- Revert: schemas/myapp_logging_public/tables/audit_log_auth/grants/authenticated/select/grant


REVOKE SELECT ON myapp_logging_public.audit_log_auth FROM authenticated;


