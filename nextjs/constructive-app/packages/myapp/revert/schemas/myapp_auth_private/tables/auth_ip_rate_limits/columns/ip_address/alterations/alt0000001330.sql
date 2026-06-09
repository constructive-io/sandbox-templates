-- Revert: schemas/myapp_auth_private/tables/auth_ip_rate_limits/columns/ip_address/alterations/alt0000001330


ALTER TABLE myapp_auth_private.auth_ip_rate_limits 
  ALTER COLUMN ip_address DROP NOT NULL;


