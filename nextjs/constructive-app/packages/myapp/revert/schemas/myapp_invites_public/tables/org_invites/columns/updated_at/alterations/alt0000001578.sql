-- Revert: schemas/myapp_invites_public/tables/org_invites/columns/updated_at/alterations/alt0000001578


ALTER TABLE myapp_invites_public.org_invites 
  ALTER COLUMN updated_at DROP DEFAULT;


