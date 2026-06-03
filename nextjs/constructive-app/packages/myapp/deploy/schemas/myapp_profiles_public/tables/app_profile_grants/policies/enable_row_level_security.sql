-- Deploy: schemas/myapp_profiles_public/tables/app_profile_grants/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_grants/table


ALTER TABLE myapp_profiles_public.app_profile_grants 
  ENABLE ROW LEVEL SECURITY;

