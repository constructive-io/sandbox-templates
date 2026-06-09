-- Revert: schemas/myapp_memberships_public/tables/app_permission_default_grants/columns/id/alterations/alt0000000289


ALTER TABLE myapp_memberships_public.app_permission_default_grants 
  ALTER COLUMN id DROP DEFAULT;


