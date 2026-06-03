-- Revert: schemas/myapp_memberships_public/tables/app_grants/columns/permissions/alterations/alt0000000271


ALTER TABLE myapp_memberships_public.app_grants 
  ALTER COLUMN permissions DROP DEFAULT;


