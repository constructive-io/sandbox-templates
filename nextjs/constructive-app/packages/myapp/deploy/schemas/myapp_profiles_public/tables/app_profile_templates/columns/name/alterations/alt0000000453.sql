-- Deploy: schemas/myapp_profiles_public/tables/app_profile_templates/columns/name/alterations/alt0000000453
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profile_templates/columns/name/column


COMMENT ON COLUMN myapp_profiles_public.app_profile_templates.name IS E'Display name for the template profile (e.g. Admin, Editor, Viewer)';

