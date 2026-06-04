-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/reserved/alterations/alt0000000549
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/reserved/column


COMMENT ON COLUMN myapp_limits_public.org_limit_aggregates.reserved IS E'Capacity reserved by child entities in budgeted allocation mode. Available = max - num - reserved.';

