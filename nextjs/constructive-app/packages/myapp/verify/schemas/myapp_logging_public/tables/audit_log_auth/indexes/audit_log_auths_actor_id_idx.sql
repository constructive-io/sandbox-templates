-- Verify: schemas/myapp_logging_public/tables/audit_log_auth/indexes/audit_log_auths_actor_id_idx


SELECT verify_index('myapp_logging_public.audit_log_auth', 'audit_log_auths_actor_id_idx');


