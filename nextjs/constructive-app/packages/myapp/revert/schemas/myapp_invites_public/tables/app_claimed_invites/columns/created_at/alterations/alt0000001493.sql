-- Revert: schemas/myapp_invites_public/tables/app_claimed_invites/columns/created_at/alterations/alt0000001493


ALTER TABLE myapp_invites_public.app_claimed_invites 
  ALTER COLUMN created_at DROP DEFAULT;


