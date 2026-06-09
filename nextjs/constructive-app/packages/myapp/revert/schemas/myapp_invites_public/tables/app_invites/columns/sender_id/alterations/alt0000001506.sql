-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/sender_id/alterations/alt0000001506


ALTER TABLE myapp_invites_public.app_invites 
  ALTER COLUMN sender_id DROP DEFAULT;


