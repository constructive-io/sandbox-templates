-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/profile_id/column


ALTER TABLE myapp_invites_public.app_invites 
  DROP COLUMN profile_id RESTRICT;


