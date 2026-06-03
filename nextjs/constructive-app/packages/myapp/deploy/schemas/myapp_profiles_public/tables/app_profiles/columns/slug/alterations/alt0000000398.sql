-- Deploy: schemas/myapp_profiles_public/tables/app_profiles/columns/slug/alterations/alt0000000398
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profiles/columns/slug/column


COMMENT ON COLUMN myapp_profiles_public.app_profiles.slug IS E'URL-safe identifier for this profile, used in API references';

