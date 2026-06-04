-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/data/column


ALTER TABLE myapp_invites_public.app_invites 
  DROP COLUMN data RESTRICT;


