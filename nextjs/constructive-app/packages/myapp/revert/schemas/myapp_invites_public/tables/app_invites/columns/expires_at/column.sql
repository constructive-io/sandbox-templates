-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/expires_at/column


ALTER TABLE myapp_invites_public.app_invites 
  DROP COLUMN expires_at RESTRICT;


