-- Deploy: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/ancestor_id/alterations/alt0000001006
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/ancestor_id/column


COMMENT ON COLUMN myapp_memberships_private.org_hierarchy_sprts.ancestor_id IS E'User ID of the ancestor (manager) in the transitive path';

