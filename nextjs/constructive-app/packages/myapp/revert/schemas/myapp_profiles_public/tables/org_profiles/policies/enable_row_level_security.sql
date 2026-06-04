-- Revert: schemas/myapp_profiles_public/tables/org_profiles/policies/enable_row_level_security


ALTER TABLE myapp_profiles_public.org_profiles 
  DISABLE ROW LEVEL SECURITY;


