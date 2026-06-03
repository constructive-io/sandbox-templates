-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/columns/permissions/alterations/alt0000000799
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/columns/permissions/column


COMMENT ON COLUMN myapp_profiles_public.org_profiles.permissions IS E'Pre-computed permission bitmask aggregating all permissions in this profile';

