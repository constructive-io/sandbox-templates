-- Revert: schemas/myapp_memberships_public/tables/app_owner_grants/columns/is_grant/alterations/alt0000000259


ALTER TABLE myapp_memberships_public.app_owner_grants 
  ALTER COLUMN is_grant DROP DEFAULT;


