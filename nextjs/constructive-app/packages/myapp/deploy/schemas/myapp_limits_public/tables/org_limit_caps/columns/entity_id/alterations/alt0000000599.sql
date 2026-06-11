-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps/columns/entity_id/alterations/alt0000000599
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps/columns/entity_id/column


COMMENT ON COLUMN myapp_limits_public.org_limit_caps.entity_id IS 'Entity this cap override applies to';

