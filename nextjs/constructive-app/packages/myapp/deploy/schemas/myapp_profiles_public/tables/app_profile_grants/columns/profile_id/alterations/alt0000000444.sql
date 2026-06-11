-- Deploy: schemas/myapp_profiles_public/tables/app_profile_grants/columns/profile_id/alterations/alt0000000444
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_grants/columns/profile_id/column


COMMENT ON COLUMN myapp_profiles_public.app_profile_grants.profile_id IS E'References the profile being assigned; NULL indicates the profile was removed';

