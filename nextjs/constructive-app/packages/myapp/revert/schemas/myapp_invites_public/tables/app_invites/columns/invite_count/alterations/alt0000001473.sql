-- Revert: schemas/myapp_invites_public/tables/app_invites/columns/invite_count/alterations/alt0000001473


ALTER TABLE myapp_invites_public.app_invites 
  ALTER COLUMN invite_count DROP NOT NULL;


