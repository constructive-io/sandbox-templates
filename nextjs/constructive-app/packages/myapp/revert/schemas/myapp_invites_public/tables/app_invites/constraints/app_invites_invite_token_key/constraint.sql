-- Revert: schemas/myapp_invites_public/tables/app_invites/constraints/app_invites_invite_token_key/constraint


ALTER TABLE myapp_invites_public.app_invites 
  DROP CONSTRAINT app_invites_invite_token_key;


