-- Deploy: schemas/myapp_profiles_public/tables/app_profile_permissions/columns/profile_id/alterations/alt0000000416
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_permissions/columns/profile_id/column


COMMENT ON COLUMN myapp_profiles_public.app_profile_permissions.profile_id IS 'References the profile this permission belongs to';

