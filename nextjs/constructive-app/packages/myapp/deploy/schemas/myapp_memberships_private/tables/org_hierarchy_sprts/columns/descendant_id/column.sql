-- Deploy: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/descendant_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/table


ALTER TABLE myapp_memberships_private.org_hierarchy_sprts 
  ADD COLUMN descendant_id uuid;

