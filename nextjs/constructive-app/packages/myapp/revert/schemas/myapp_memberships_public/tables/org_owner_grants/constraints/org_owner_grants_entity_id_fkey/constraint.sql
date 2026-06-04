-- Revert: schemas/myapp_memberships_public/tables/org_owner_grants/constraints/org_owner_grants_entity_id_fkey/constraint


ALTER TABLE myapp_memberships_public.org_owner_grants 
  DROP CONSTRAINT org_owner_grants_entity_id_fkey;


