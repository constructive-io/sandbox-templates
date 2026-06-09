-- Deploy: schemas/myapp_profiles_public/tables/org_profile_definition_grants/alterations/alt0000000868
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_definition_grants/table


ALTER TABLE myapp_profiles_public.org_profile_definition_grants 
  DISABLE ROW LEVEL SECURITY;

