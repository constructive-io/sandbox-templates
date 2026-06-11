-- Deploy: schemas/myapp_profiles_public/tables/org_profile_definition_grants/columns/profile_id/alterations/alt0000000872
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_definition_grants/columns/profile_id/column


COMMENT ON COLUMN myapp_profiles_public.org_profile_definition_grants.profile_id IS E'References the profile whose definition was modified; NULL if profile was deleted';

