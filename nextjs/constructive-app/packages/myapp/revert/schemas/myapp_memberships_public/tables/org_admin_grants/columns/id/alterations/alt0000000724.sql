-- Revert: schemas/myapp_memberships_public/tables/org_admin_grants/columns/id/alterations/alt0000000724


ALTER TABLE myapp_memberships_public.org_admin_grants 
  ALTER COLUMN id DROP DEFAULT;


