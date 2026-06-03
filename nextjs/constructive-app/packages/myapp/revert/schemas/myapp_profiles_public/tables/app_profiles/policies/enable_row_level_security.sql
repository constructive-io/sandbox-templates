-- Revert: schemas/myapp_profiles_public/tables/app_profiles/policies/enable_row_level_security


ALTER TABLE myapp_profiles_public.app_profiles 
  DISABLE ROW LEVEL SECURITY;


