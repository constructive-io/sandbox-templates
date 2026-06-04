-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/invite_count/column


ALTER TABLE myapp_invites_public.app_invites 
  DROP COLUMN invite_count RESTRICT;


