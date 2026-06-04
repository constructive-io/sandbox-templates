-- Deploy: schemas/myapp_auth_private/tables/auth_ip_rate_limits/indexes/auth_ip_rate_limits_ip_address_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/table
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/columns/ip_address/column


CREATE INDEX auth_ip_rate_limits_ip_address_idx ON myapp_auth_private.auth_ip_rate_limits USING BTREE ( ip_address );

