-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/policies/auth_sel_dir_own/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/policies/enable_row_level_security


CREATE POLICY auth_sel_dir_own ON myapp_logging_public.audit_log_auth
FOR SELECT
TO authenticated
USING (
  actor_id = jwt_public.current_user_id()
);

