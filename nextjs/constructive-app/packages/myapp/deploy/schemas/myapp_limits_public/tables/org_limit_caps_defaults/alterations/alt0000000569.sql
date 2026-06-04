-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps_defaults/alterations/alt0000000569
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps_defaults/table


COMMENT ON TABLE myapp_limits_public.org_limit_caps_defaults IS E'Default cap values for static configuration limits (max file size, feature flags, etc.). Not metered — just read by consumers.';

