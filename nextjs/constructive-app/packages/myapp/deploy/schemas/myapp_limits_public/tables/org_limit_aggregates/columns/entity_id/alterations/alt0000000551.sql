-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/entity_id/alterations/alt0000000551
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/columns/entity_id/column


COMMENT ON COLUMN myapp_limits_public.org_limit_aggregates.entity_id IS E'Entity (org) whose aggregate usage is being tracked';

