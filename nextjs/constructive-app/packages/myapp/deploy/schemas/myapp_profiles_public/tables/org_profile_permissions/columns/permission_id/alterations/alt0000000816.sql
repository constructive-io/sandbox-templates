-- Deploy: schemas/myapp_profiles_public/tables/org_profile_permissions/columns/permission_id/alterations/alt0000000816
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_permissions/columns/permission_id/column


COMMENT ON COLUMN myapp_profiles_public.org_profile_permissions.permission_id IS 'References the permission included in this profile';

