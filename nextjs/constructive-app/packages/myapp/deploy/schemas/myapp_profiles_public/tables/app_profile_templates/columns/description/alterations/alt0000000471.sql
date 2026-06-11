-- Deploy: schemas/myapp_profiles_public/tables/app_profile_templates/columns/description/alterations/alt0000000471
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_templates/columns/description/column


COMMENT ON COLUMN myapp_profiles_public.app_profile_templates.description IS E'Human-readable description of this template profile';

