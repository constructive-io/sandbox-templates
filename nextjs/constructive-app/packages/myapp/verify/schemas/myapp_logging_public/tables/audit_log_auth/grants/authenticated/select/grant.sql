-- Verify: schemas/myapp_logging_public/tables/audit_log_auth/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_logging_public.audit_log_auth', 'select', 'authenticated');


