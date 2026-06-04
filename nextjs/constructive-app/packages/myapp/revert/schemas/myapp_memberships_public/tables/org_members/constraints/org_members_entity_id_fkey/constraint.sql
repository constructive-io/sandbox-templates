-- Revert: schemas/myapp_memberships_public/tables/org_members/constraints/org_members_entity_id_fkey/constraint


ALTER TABLE myapp_memberships_public.org_members 
  DROP CONSTRAINT org_members_entity_id_fkey;


