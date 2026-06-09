-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/max/alterations/alt0000000553
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/max/column


COMMENT ON COLUMN myapp_limits_public.org_limit_aggregates.max IS E'Maximum allowed aggregate usage; negative means unlimited';

