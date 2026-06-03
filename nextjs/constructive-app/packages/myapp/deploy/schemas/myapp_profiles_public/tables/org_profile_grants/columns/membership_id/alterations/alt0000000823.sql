-- Deploy: schemas/myapp_profiles_public/tables/org_profile_grants/columns/membership_id/alterations/alt0000000823
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_grants/table
-- requires: schemas/myapp_profiles_public/tables/org_profile_grants/columns/membership_id/column


ALTER TABLE myapp_profiles_public.org_profile_grants 
  ALTER COLUMN membership_id SET NOT NULL;

