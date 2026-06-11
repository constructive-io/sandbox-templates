-- Revert: schemas/myapp_auth_private/tables/auth_ip_rate_limits/columns/id/column


ALTER TABLE myapp_auth_private.auth_ip_rate_limits 
  DROP COLUMN id RESTRICT;


