-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/num/alterations/alt0000000552
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/num/column


COMMENT ON COLUMN myapp_limits_public.org_limit_aggregates.num IS 'Current aggregate usage count for this entity and limit';

