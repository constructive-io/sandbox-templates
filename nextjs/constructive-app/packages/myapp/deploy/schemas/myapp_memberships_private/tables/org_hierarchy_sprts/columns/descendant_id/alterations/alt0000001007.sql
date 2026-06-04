-- Deploy: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/descendant_id/alterations/alt0000001007
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/table
-- requires: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/descendant_id/column


ALTER TABLE myapp_memberships_private.org_hierarchy_sprts 
  ALTER COLUMN descendant_id SET NOT NULL;

