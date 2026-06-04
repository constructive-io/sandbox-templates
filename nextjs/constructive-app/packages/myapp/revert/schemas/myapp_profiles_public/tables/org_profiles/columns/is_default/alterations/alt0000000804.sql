-- Revert: schemas/myapp_profiles_public/tables/org_profiles/columns/is_default/alterations/alt0000000804


ALTER TABLE myapp_profiles_public.org_profiles 
  ALTER COLUMN is_default DROP DEFAULT;


