-- Deploy: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/ancestor_id/alterations/alt0000001005
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/table
-- requires: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/ancestor_id/column


ALTER TABLE myapp_memberships_private.org_hierarchy_sprts 
  ALTER COLUMN ancestor_id SET NOT NULL;

