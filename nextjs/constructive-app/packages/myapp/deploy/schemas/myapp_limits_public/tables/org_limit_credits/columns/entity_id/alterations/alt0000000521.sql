-- Deploy: schemas/myapp_limits_public/tables/org_limit_credits/columns/entity_id/alterations/alt0000000521
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/columns/entity_id/column


COMMENT ON COLUMN myapp_limits_public.org_limit_credits.entity_id IS E'Entity this credit applies to; NULL for actor-only credits';

