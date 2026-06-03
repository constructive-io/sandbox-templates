-- Revert: schemas/myapp_auth_private/tables/auth_ip_rate_limits/columns/attempts/alterations/alt0000001298


ALTER TABLE myapp_auth_private.auth_ip_rate_limits 
  ALTER COLUMN attempts DROP NOT NULL;


