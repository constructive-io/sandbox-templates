-- Revert: schemas/myapp_memberships_public/tables/org_admin_grants/columns/updated_at/alterations/alt0000000734


ALTER TABLE myapp_memberships_public.org_admin_grants 
  ALTER COLUMN updated_at DROP DEFAULT;


