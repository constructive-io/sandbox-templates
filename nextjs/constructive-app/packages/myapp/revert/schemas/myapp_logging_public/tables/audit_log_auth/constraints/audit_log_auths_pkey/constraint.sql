-- Revert: schemas/myapp_logging_public/tables/audit_log_auth/constraints/audit_log_auths_pkey/constraint


ALTER TABLE myapp_logging_public.audit_log_auth 
  DROP CONSTRAINT audit_log_auths_pkey;


