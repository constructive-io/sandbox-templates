-- Deploy: schemas/myapp_limits_public/tables/org_limit_defaults/columns/max/alterations/alt0000000527
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_defaults/columns/max/column


COMMENT ON COLUMN myapp_limits_public.org_limit_defaults.max IS 'Default maximum usage allowed for this limit';

