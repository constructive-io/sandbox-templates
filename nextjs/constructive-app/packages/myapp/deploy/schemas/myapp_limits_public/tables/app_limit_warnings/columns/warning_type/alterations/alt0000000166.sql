-- Deploy: schemas/myapp_limits_public/tables/app_limit_warnings/columns/warning_type/alterations/alt0000000166
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_warnings/columns/warning_type/column


COMMENT ON COLUMN myapp_limits_public.app_limit_warnings.warning_type IS E'Threshold type: absolute (fixed count) or percentage (of max)';

