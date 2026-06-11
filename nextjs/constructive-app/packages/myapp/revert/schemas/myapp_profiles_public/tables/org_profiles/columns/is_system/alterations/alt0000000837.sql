-- Revert: schemas/myapp_profiles_public/tables/org_profiles/columns/is_system/alterations/alt0000000837


ALTER TABLE myapp_profiles_public.org_profiles 
  ALTER COLUMN is_system DROP DEFAULT;


