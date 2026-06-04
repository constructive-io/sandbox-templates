-- Revert: schemas/myapp_auth_private/tables/auth_rate_limits/columns/action/alterations/alt0000001311


ALTER TABLE myapp_auth_private.auth_rate_limits 
  ALTER COLUMN action DROP NOT NULL;


