-- Revert: schemas/myapp_invites_public/tables/org_invites/constraints/org_invites_entity_id_fkey/constraint


ALTER TABLE myapp_invites_public.org_invites 
  DROP CONSTRAINT org_invites_entity_id_fkey;


