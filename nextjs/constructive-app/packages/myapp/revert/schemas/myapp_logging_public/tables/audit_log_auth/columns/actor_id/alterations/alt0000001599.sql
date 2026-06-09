-- Revert: schemas/myapp_logging_public/tables/audit_log_auth/columns/actor_id/alterations/alt0000001599


ALTER TABLE myapp_logging_public.audit_log_auth 
  ALTER COLUMN actor_id DROP DEFAULT;


