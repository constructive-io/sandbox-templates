-- Revert: schemas/myapp_memberships_public/tables/org_owner_grants/columns/id/alterations/alt0000000737


ALTER TABLE myapp_memberships_public.org_owner_grants 
  ALTER COLUMN id DROP NOT NULL;


