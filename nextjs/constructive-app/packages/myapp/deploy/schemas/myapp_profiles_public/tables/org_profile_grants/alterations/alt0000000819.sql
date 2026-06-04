-- Deploy: schemas/myapp_profiles_public/tables/org_profile_grants/alterations/alt0000000819
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_grants/table


ALTER TABLE myapp_profiles_public.org_profile_grants 
  DISABLE ROW LEVEL SECURITY;

