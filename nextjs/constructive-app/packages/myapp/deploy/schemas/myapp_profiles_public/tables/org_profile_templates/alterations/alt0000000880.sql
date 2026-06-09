-- Deploy: schemas/myapp_profiles_public/tables/org_profile_templates/alterations/alt0000000880
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/table


ALTER TABLE myapp_profiles_public.org_profile_templates 
  DISABLE ROW LEVEL SECURITY;

