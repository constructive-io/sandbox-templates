-- Deploy: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/depth/alterations/alt0000001044
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/depth/column


COMMENT ON COLUMN myapp_memberships_private.org_hierarchy_sprts.depth IS E'Number of edges between ancestor and descendant (0 = self-reference)';

