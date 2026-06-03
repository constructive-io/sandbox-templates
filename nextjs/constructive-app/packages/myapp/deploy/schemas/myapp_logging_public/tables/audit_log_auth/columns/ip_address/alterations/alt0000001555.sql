-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/columns/ip_address/alterations/alt0000001555
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/columns/ip_address/column


ALTER TABLE myapp_logging_public.audit_log_auth 
  ALTER COLUMN ip_address SET DEFAULT jwt_public.current_ip_address();

