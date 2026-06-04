-- Revert: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/depth/alterations/alt0000001009


ALTER TABLE myapp_memberships_private.org_hierarchy_sprts 
  ALTER COLUMN depth DROP NOT NULL;


