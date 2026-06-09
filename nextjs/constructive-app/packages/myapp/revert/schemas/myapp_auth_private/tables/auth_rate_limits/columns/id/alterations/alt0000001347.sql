-- Revert: schemas/myapp_auth_private/tables/auth_rate_limits/columns/id/alterations/alt0000001347


ALTER TABLE myapp_auth_private.auth_rate_limits 
  ALTER COLUMN id DROP DEFAULT;


