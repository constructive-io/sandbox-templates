-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/invite_valid/alterations/alt0000001467


ALTER TABLE myapp_invites_public.app_invites 
  ALTER COLUMN invite_valid DROP NOT NULL;


