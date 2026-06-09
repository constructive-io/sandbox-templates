-- Revert: schemas/myapp_auth_private/tables/auth_rate_limits/columns/created_at/alterations/alt0000001358


ALTER TABLE myapp_auth_private.auth_rate_limits 
  ALTER COLUMN created_at DROP DEFAULT;


