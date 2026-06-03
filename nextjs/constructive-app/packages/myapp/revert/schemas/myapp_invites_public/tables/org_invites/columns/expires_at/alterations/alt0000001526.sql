-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/expires_at/alterations/alt0000001526


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN expires_at DROP DEFAULT;


