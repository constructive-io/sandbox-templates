-- Revert: schemas/myapp_auth_private/tables/auth_rate_limits/columns/updated_at/alterations/alt0000001359


ALTER TABLE myapp_auth_private.auth_rate_limits 
  ALTER COLUMN updated_at DROP DEFAULT;


