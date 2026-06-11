-- Revert: schemas/myapp_memberships_public/tables/org_admin_grants/constraints/org_admin_grants_pkey/constraint


ALTER TABLE myapp_memberships_public.org_admin_grants 
  DROP CONSTRAINT org_admin_grants_pkey;


