-- Deploy: schemas/myapp_auth_private/tables/app_settings_rate_limit/alterations/alt0000001251
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/app_settings_rate_limit/table


COMMENT ON TABLE myapp_auth_private.app_settings_rate_limit IS E'Singleton configuration table for rate limiting thresholds including IP-based and user-based windows, attempt limits, and lockout durations';

