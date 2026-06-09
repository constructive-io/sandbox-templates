-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/invite_token/alterations/alt0000001508


ALTER TABLE myapp_invites_public.app_invites 
  ALTER COLUMN invite_token DROP NOT NULL;


