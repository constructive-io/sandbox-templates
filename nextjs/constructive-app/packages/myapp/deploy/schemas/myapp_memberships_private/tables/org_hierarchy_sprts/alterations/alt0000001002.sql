-- Deploy: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/alterations/alt0000001002
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/table


COMMENT ON TABLE myapp_memberships_private.org_hierarchy_sprts IS E'Transitive closure support table for fast ancestor/descendant lookups; rebuilt automatically by triggers';

