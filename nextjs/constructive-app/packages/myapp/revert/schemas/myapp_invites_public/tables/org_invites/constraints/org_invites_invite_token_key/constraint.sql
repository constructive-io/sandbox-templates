-- Revert: schemas/myapp_invites_public/tables/org_invites/constraints/org_invites_invite_token_key/constraint


ALTER TABLE myapp_invites_public.org_invites 
  DROP CONSTRAINT org_invites_invite_token_key;


