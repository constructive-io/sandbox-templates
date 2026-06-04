-- Revert: schemas/myapp_memberships_public/tables/org_grants/columns/id/alterations/alt0000000772


ALTER TABLE myapp_memberships_public.org_grants 
  ALTER COLUMN id DROP NOT NULL;


