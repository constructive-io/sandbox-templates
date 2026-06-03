-- Revert: schemas/myapp_memberships_public/tables/org_grants/constraints/org_grants_pkey/constraint


ALTER TABLE myapp_memberships_public.org_grants 
  DROP CONSTRAINT org_grants_pkey;


