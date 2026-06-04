-- Deploy: schemas/myapp_limits_public/tables/org_limit_warnings/columns/threshold_value/alterations/alt0000000597
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_warnings/columns/threshold_value/column


COMMENT ON COLUMN myapp_limits_public.org_limit_warnings.threshold_value IS E'Threshold value — either an absolute count or a percentage (1-100) depending on warning_type';

