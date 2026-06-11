-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/id/column


ALTER TABLE myapp_invites_public.app_invites 
  DROP COLUMN id RESTRICT;


