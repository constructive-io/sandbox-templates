-- Revert: schemas/myapp_logging_public/tables/audit_log_auth/columns/actor_id/column


ALTER TABLE myapp_logging_public.audit_log_auth 
  DROP COLUMN actor_id RESTRICT;


