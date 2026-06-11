-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/invite_limit/alterations/alt0000001515


ALTER TABLE myapp_invites_public.app_invites 
  ALTER COLUMN invite_limit DROP DEFAULT;


