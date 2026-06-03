-- Revert: schemas/myapp_auth_private/tables/auth_ip_rate_limits/constraints/auth_ip_rate_limits_ip_address_ua_hash_action_key/constraint


ALTER TABLE myapp_auth_private.auth_ip_rate_limits 
  DROP CONSTRAINT auth_ip_rate_limits_ip_address_ua_hash_action_key;


