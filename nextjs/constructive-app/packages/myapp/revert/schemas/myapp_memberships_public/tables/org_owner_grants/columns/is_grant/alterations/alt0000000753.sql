-- Revert: schemas/myapp_memberships_public/tables/org_owner_grants/columns/is_grant/alterations/alt0000000753


ALTER TABLE myapp_memberships_public.org_owner_grants 
  ALTER COLUMN is_grant DROP NOT NULL;


