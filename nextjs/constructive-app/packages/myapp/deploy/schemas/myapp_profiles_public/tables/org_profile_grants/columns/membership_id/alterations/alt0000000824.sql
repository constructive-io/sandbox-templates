-- Deploy: schemas/myapp_profiles_public/tables/org_profile_grants/columns/membership_id/alterations/alt0000000824
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_grants/columns/membership_id/column


COMMENT ON COLUMN myapp_profiles_public.org_profile_grants.membership_id IS 'References the membership that received or lost this profile';

