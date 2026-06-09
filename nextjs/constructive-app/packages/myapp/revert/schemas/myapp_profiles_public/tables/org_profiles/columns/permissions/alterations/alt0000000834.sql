-- Revert: schemas/myapp_profiles_public/tables/org_profiles/columns/permissions/alterations/alt0000000834


ALTER TABLE myapp_profiles_public.org_profiles 
  ALTER COLUMN permissions DROP DEFAULT;


