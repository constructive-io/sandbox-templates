-- Revert: schemas/myapp_memberships_public/tables/app_admin_grants/constraints/app_admin_grants_pkey/constraint


ALTER TABLE myapp_memberships_public.app_admin_grants 
  DROP CONSTRAINT app_admin_grants_pkey;


