-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/updated_at/alterations/alt0000001529


ALTER TABLE myapp_invites_public.app_invites 
  ALTER COLUMN updated_at DROP DEFAULT;


