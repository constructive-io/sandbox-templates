-- Deploy: schemas/myapp_profiles_public/tables/app_profile_permissions/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_permissions/table


ALTER TABLE myapp_profiles_public.app_profile_permissions 
  ENABLE ROW LEVEL SECURITY;

