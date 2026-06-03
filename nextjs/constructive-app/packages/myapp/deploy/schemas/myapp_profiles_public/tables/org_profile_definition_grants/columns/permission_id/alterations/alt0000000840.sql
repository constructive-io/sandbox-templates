-- Deploy: schemas/myapp_profiles_public/tables/org_profile_definition_grants/columns/permission_id/alterations/alt0000000840
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_definition_grants/columns/permission_id/column


COMMENT ON COLUMN myapp_profiles_public.org_profile_definition_grants.permission_id IS 'References the permission that was added to or removed from the profile';

