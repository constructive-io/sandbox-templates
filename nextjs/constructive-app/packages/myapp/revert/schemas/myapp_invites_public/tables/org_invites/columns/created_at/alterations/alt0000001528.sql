-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/created_at/alterations/alt0000001528


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN created_at DROP DEFAULT;


