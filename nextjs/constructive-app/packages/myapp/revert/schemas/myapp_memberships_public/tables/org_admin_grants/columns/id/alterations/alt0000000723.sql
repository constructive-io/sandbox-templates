-- Revert: schemas/myapp_memberships_public/tables/org_admin_grants/columns/id/alterations/alt0000000723


ALTER TABLE myapp_memberships_public.org_admin_grants 
  ALTER COLUMN id DROP NOT NULL;


