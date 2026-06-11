-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/created_at/column


ALTER TABLE myapp_invites_public.app_invites 
  DROP COLUMN created_at RESTRICT;


