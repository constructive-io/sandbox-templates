-- Deploy: schemas/myapp_limits_public/tables/org_limit_warnings/columns/entity_id/alterations/alt0000000600
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_warnings/columns/entity_id/column


COMMENT ON COLUMN myapp_limits_public.org_limit_warnings.entity_id IS E'Per-entity override (NULL = scope default for all entities)';

