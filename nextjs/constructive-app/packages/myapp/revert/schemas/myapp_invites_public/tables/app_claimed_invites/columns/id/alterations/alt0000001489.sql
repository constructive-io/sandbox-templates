-- Revert: schemas/myapp_invites_public/tables/app_claimed_invites/columns/id/alterations/alt0000001489


ALTER TABLE myapp_invites_public.app_claimed_invites 
  ALTER COLUMN id DROP DEFAULT;


