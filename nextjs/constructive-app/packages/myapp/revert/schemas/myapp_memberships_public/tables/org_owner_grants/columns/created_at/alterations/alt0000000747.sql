-- Revert: schemas/myapp_memberships_public/tables/org_owner_grants/columns/created_at/alterations/alt0000000747


ALTER TABLE myapp_memberships_public.org_owner_grants 
  ALTER COLUMN created_at DROP DEFAULT;


