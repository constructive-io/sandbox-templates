-- Deploy: schemas/myapp_limits_public/tables/app_limits/columns/plan_max/alterations/alt0000000061
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/columns/plan_max/column


COMMENT ON COLUMN myapp_limits_public.app_limits.plan_max IS E'Ceiling set by the active plan via apply_plan(). Window reset does not change this value.';

