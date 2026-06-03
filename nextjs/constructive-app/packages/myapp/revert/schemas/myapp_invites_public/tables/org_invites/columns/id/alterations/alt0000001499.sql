-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/id/alterations/alt0000001499


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN id DROP DEFAULT;


