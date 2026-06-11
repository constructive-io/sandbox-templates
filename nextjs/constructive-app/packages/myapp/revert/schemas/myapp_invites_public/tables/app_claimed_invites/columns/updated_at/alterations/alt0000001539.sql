-- Revert: schemas/myapp_invites_public/tables/app_claimed_invites/columns/updated_at/alterations/alt0000001539


ALTER TABLE myapp_invites_public.app_claimed_invites 
  ALTER COLUMN updated_at DROP DEFAULT;


