-- Revert: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/ancestor_id/alterations/alt0000001005


ALTER TABLE myapp_memberships_private.org_hierarchy_sprts 
  ALTER COLUMN ancestor_id DROP NOT NULL;


