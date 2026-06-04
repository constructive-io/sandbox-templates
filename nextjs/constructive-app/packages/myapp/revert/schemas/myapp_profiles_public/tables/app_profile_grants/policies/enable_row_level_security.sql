-- Revert: schemas/myapp_profiles_public/tables/app_profile_grants/policies/enable_row_level_security


ALTER TABLE myapp_profiles_public.app_profile_grants 
  DISABLE ROW LEVEL SECURITY;


