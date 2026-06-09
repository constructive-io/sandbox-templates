-- Deploy: schemas/myapp_profiles_public/tables/app_profile_permissions/alterations/alt0000000429
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_permissions/table


ALTER TABLE myapp_profiles_public.app_profile_permissions 
  DISABLE ROW LEVEL SECURITY;

