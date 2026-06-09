-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/channel/column


ALTER TABLE myapp_invites_public.app_invites 
  DROP COLUMN channel RESTRICT;


