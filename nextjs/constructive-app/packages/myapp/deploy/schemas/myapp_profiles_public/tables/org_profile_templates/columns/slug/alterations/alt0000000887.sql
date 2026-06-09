-- Deploy: schemas/myapp_profiles_public/tables/org_profile_templates/columns/slug/alterations/alt0000000887
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/columns/slug/column


COMMENT ON COLUMN myapp_profiles_public.org_profile_templates.slug IS E'URL-safe identifier for the template profile';

