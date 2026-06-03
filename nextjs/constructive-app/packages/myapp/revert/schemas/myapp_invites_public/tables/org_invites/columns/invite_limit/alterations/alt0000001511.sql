-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/invite_limit/alterations/alt0000001511


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN invite_limit DROP NOT NULL;


