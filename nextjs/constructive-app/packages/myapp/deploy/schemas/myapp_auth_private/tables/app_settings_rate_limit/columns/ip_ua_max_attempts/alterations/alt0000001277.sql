-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/ip_ua_max_attempts/alterations/alt0000001277
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/columns/ip_ua_max_attempts/column


COMMENT ON COLUMN myapp_auth_private.app_settings_rate_limit.ip_ua_max_attempts IS E'Maximum attempts per IP + User-Agent pair within the IP rate limit window before lockout (second tier, catches individual attackers on shared networks)';

