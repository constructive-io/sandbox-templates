-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/organization_id/alterations/alt0000000550
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/organization_id/column


COMMENT ON COLUMN myapp_limits_public.org_limit_aggregates.organization_id IS E'Resolved billable organization via get_organization_id';

