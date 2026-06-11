-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/columns/actor_id/alterations/alt0000001599
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/columns/actor_id/column


ALTER TABLE myapp_logging_public.audit_log_auth 
  ALTER COLUMN actor_id SET DEFAULT jwt_public.current_user_id();

