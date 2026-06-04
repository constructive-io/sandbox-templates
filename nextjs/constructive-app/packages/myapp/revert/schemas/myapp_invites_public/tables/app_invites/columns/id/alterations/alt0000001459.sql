-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/id/alterations/alt0000001459


ALTER TABLE myapp_invites_public.app_invites 
  ALTER COLUMN id DROP DEFAULT;


