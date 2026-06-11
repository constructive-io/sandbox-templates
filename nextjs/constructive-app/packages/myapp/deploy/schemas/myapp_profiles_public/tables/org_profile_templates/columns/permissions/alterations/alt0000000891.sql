-- Deploy: schemas/myapp_profiles_public/tables/org_profile_templates/columns/permissions/alterations/alt0000000891
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/columns/permissions/column


COMMENT ON COLUMN myapp_profiles_public.org_profile_templates.permissions IS E'Pre-computed permission bitmask for the seeded profile';

