-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/id/alterations/alt0000001544


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN id DROP DEFAULT;


