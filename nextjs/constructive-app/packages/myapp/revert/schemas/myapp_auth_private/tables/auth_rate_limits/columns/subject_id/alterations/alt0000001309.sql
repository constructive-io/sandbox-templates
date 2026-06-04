-- Revert: schemas/myapp_auth_private/tables/auth_rate_limits/columns/subject_id/alterations/alt0000001309


ALTER TABLE myapp_auth_private.auth_rate_limits 
  ALTER COLUMN subject_id DROP NOT NULL;


