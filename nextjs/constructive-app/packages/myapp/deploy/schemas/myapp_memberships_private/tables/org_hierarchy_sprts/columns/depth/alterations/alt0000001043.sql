-- Deploy: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/depth/alterations/alt0000001043
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/table
-- requires: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/depth/column


ALTER TABLE myapp_memberships_private.org_hierarchy_sprts 
  ALTER COLUMN depth SET NOT NULL;

