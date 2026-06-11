-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/invite_token/alterations/alt0000001554


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN invite_token DROP NOT NULL;


