-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps_defaults/columns/max/alterations/alt0000000591
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps_defaults/columns/max/column


COMMENT ON COLUMN myapp_limits_public.org_limit_caps_defaults.max IS E'Default cap value. For feature flags: 0=disabled, 1=enabled. For size caps: the limit in bytes/units.';

