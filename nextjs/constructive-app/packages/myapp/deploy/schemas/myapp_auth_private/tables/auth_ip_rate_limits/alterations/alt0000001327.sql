-- Deploy: schemas/myapp_auth_private/tables/auth_ip_rate_limits/alterations/alt0000001327
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_ip_rate_limits/table


COMMENT ON TABLE myapp_auth_private.auth_ip_rate_limits IS E'Tracks per-IP-address rate limiting state for anonymous auth functions with native inet type support and /64 IPv6 normalization';

