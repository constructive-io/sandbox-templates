-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/columns/origin/alterations/alt0000001551
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/columns/origin/column


ALTER TABLE myapp_logging_public.audit_log_auth 
  ALTER COLUMN origin SET DEFAULT jwt_public.current_origin();

