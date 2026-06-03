-- Deploy: schemas/myapp_profiles_public/tables/app_profile_templates/alterations/alt0000000448
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_templates/table


ALTER TABLE myapp_profiles_public.app_profile_templates 
  DISABLE ROW LEVEL SECURITY;

