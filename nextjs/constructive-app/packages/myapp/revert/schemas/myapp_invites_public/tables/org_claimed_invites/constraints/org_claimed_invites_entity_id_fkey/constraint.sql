-- Revert: schemas/myapp_invites_public/tables/org_claimed_invites/constraints/org_claimed_invites_entity_id_fkey/constraint


ALTER TABLE myapp_invites_public.org_claimed_invites 
  DROP CONSTRAINT org_claimed_invites_entity_id_fkey;


