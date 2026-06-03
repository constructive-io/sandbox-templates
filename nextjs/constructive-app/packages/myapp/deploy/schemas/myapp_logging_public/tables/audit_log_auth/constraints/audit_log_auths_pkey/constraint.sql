-- Deploy: schemas/myapp_logging_public/tables/audit_log_auth/constraints/audit_log_auths_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_logging_public/schema
-- requires: schemas/myapp_logging_public/tables/audit_log_auth/table


ALTER TABLE myapp_logging_public.audit_log_auth 
  ADD CONSTRAINT audit_log_auths_pkey PRIMARY KEY (created_at, id);

