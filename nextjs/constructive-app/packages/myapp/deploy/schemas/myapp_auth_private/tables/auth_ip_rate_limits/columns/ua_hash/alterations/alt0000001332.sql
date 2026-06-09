-- Deploy: schemas/myapp_auth_private/tables/auth_ip_rate_limits/columns/ua_hash/alterations/alt0000001332
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/columns/ua_hash/column


ALTER TABLE myapp_auth_private.auth_ip_rate_limits 
  ALTER COLUMN ua_hash SET NOT NULL;

