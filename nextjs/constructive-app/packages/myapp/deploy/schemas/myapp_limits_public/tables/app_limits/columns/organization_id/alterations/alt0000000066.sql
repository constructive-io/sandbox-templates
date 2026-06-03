-- Deploy: schemas/myapp_limits_public/tables/app_limits/columns/organization_id/alterations/alt0000000066
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/columns/organization_id/column


COMMENT ON COLUMN myapp_limits_public.app_limits.organization_id IS E'Resolved billable organization via get_organization_id';

