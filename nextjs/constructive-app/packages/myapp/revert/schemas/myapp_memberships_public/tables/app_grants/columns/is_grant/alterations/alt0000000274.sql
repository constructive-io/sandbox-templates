-- Revert: schemas/myapp_memberships_public/tables/app_grants/columns/is_grant/alterations/alt0000000274


ALTER TABLE myapp_memberships_public.app_grants 
  ALTER COLUMN is_grant DROP DEFAULT;


