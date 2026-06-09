-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/columns/name/alterations/alt0000000829
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/columns/name/column


COMMENT ON COLUMN myapp_profiles_public.org_profiles.name IS E'Display name for this profile (e.g. Admin, Editor, Viewer)';

