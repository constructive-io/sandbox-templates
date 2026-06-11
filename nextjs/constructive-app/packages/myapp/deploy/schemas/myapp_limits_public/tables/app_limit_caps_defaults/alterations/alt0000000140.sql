-- Deploy: schemas/myapp_limits_public/tables/app_limit_caps_defaults/alterations/alt0000000140
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_caps_defaults/table


COMMENT ON TABLE myapp_limits_public.app_limit_caps_defaults IS E'Default cap values for static configuration limits (max file size, feature flags, etc.). Not metered — just read by consumers.';

