-- Deploy: schemas/myapp_limits_public/tables/org_limit_defaults/columns/soft_max/alterations/alt0000000528
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_defaults/columns/soft_max/column


COMMENT ON COLUMN myapp_limits_public.org_limit_defaults.soft_max IS E'Default soft limit threshold for warnings; NULL means no soft limit';

