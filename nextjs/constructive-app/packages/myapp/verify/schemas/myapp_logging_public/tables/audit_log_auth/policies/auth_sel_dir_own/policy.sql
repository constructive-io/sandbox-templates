-- Verify: schemas/myapp_logging_public/tables/audit_log_auth/policies/auth_sel_dir_own/policy


SELECT verify_policy('auth_sel_dir_own', 'myapp_logging_public.audit_log_auth');


