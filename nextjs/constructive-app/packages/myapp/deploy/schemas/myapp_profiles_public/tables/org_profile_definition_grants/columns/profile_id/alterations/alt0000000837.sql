-- Deploy: schemas/myapp_profiles_public/tables/org_profile_definition_grants/columns/profile_id/alterations/alt0000000837
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_definition_grants/table
-- requires: schemas/myapp_profiles_public/tables/org_profile_definition_grants/columns/profile_id/column


ALTER TABLE myapp_profiles_public.org_profile_definition_grants 
  ALTER COLUMN profile_id SET NOT NULL;

