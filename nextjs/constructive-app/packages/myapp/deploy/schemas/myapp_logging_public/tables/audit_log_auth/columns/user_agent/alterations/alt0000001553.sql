-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/columns/user_agent/alterations/alt0000001553
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/columns/user_agent/column


ALTER TABLE myapp_logging_public.audit_log_auth 
  ALTER COLUMN user_agent SET DEFAULT jwt_public.current_user_agent();

