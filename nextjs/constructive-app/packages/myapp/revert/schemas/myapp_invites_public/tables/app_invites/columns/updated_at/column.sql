-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/updated_at/column


ALTER TABLE myapp_invites_public.app_invites 
  DROP COLUMN updated_at RESTRICT;


