-- Deploy: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/entity_id/alterations/alt0000001004
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/entity_id/column


COMMENT ON COLUMN myapp_memberships_private.org_hierarchy_sprts.entity_id IS 'Organization this closure row belongs to';

