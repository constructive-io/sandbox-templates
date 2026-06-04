-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/constraints/audit_log_auths_actor_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table


ALTER TABLE myapp_logging_public.audit_log_auth 
  ADD CONSTRAINT audit_log_auths_actor_id_fkey 
    FOREIGN KEY(actor_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE SET NULL;

