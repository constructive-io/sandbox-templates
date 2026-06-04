-- Revert: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/columns/entity_id/alterations/alt0000001003


ALTER TABLE myapp_memberships_private.org_hierarchy_sprts 
  ALTER COLUMN entity_id DROP NOT NULL;


