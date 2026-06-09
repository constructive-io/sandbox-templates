-- Deploy: schemas/myapp_auth_private/tables/auth_ip_rate_limits/columns/ip_address/alterations/alt0000001331
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/columns/ip_address/column


COMMENT ON COLUMN myapp_auth_private.auth_ip_rate_limits.ip_address IS E'Client IP address (IPv4 or IPv6 normalized to /64 prefix) being rate limited';

