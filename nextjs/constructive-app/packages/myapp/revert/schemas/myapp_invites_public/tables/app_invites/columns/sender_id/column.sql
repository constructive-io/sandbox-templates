-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/sender_id/column


ALTER TABLE myapp_invites_public.app_invites 
  DROP COLUMN sender_id RESTRICT;


