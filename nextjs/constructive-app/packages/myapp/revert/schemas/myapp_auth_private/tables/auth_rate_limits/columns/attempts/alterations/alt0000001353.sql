-- Revert: schemas/myapp_auth_private/tables/auth_rate_limits/columns/attempts/alterations/alt0000001353


ALTER TABLE myapp_auth_private.auth_rate_limits 
  ALTER COLUMN attempts DROP DEFAULT;


