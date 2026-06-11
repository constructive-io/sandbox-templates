-- Deploy: schemas/myapp_profiles_public/tables/app_profiles/columns/permissions/alterations/alt0000000420
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profiles/columns/permissions/column


COMMENT ON COLUMN myapp_profiles_public.app_profiles.permissions IS E'Pre-computed permission bitmask aggregating all permissions in this profile';

