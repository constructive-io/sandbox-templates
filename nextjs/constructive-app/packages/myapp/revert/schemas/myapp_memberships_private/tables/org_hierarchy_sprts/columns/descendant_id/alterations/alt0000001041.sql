-- Revert: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/descendant_id/alterations/alt0000001041


ALTER TABLE myapp_memberships_private.org_hierarchy_sprts 
  ALTER COLUMN descendant_id DROP NOT NULL;


