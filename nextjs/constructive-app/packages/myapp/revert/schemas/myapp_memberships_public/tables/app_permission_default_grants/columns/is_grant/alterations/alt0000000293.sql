-- Revert: schemas/myapp_memberships_public/tables/app_permission_default_grants/columns/is_grant/alterations/alt0000000293


ALTER TABLE myapp_memberships_public.app_permission_default_grants 
  ALTER COLUMN is_grant DROP DEFAULT;


