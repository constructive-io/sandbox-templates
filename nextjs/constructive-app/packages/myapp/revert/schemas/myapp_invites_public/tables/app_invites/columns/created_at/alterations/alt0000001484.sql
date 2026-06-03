-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/created_at/alterations/alt0000001484


ALTER TABLE myapp_invites_public.app_invites 
  ALTER COLUMN created_at DROP DEFAULT;


