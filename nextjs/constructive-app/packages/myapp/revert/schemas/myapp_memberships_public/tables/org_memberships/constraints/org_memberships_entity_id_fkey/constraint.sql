-- Revert: schemas/myapp_memberships_public/tables/org_memberships/constraints/org_memberships_entity_id_fkey/constraint


ALTER TABLE myapp_memberships_public.org_memberships 
  DROP CONSTRAINT org_memberships_entity_id_fkey;


