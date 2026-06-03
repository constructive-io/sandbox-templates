-- Revert: schemas/myapp_auth_private/tables/auth_ip_rate_limits/columns/id/alterations/alt0000001289


ALTER TABLE myapp_auth_private.auth_ip_rate_limits 
  ALTER COLUMN id DROP NOT NULL;


