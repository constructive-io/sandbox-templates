-- Deploy: schemas/myapp_profiles_public/tables/app_profile_definition_grants/columns/permission_id/alterations/alt0000000456
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_definition_grants/columns/permission_id/column


COMMENT ON COLUMN myapp_profiles_public.app_profile_definition_grants.permission_id IS E'References the permission that was added to or removed from the profile; NULL if permission was deleted';

