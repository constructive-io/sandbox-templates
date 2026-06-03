-- Deploy: schemas/myapp_limits_public/tables/app_limits/columns/soft_max/alterations/alt0000000057
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/columns/soft_max/column


COMMENT ON COLUMN myapp_limits_public.app_limits.soft_max IS E'Soft limit threshold for warnings; NULL means no soft limit. When num >= soft_max, consumers should warn but still allow until max is reached.';

