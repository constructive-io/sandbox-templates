-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/expires_at/alterations/alt0000001526


ALTER TABLE myapp_invites_public.app_invites 
  ALTER COLUMN expires_at DROP DEFAULT;


