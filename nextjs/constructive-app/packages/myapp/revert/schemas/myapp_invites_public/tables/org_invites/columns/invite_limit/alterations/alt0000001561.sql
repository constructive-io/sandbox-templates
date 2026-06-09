-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/invite_limit/alterations/alt0000001561


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN invite_limit DROP DEFAULT;


