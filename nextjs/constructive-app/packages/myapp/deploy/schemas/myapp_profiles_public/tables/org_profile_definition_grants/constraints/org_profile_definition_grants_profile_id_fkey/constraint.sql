-- Deploy: schemas/myapp_profiles_public/tables/org_profile_definition_grants/constraints/org_profile_definition_grants_profile_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/table
-- requires: schemas/myapp_profiles_public/tables/org_profile_definition_grants/table


ALTER TABLE myapp_profiles_public.org_profile_definition_grants 
  ADD CONSTRAINT org_profile_definition_grants_profile_id_fkey 
    FOREIGN KEY(profile_id) 
    REFERENCES myapp_profiles_public.org_profiles (id) 
    ON DELETE SET NULL;

