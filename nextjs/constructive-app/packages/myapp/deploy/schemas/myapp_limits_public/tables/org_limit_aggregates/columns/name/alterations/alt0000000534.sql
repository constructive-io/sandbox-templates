-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/name/alterations/alt0000000534
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/name/column


COMMENT ON COLUMN myapp_limits_public.org_limit_aggregates.name IS 'Name identifier of the aggregate limit being tracked';

