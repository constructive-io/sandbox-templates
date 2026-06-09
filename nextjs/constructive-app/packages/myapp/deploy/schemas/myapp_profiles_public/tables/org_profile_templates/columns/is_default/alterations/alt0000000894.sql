-- Deploy: schemas/myapp_profiles_public/tables/org_profile_templates/columns/is_default/alterations/alt0000000894
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_templates/columns/is_default/column


COMMENT ON COLUMN myapp_profiles_public.org_profile_templates.is_default IS 'Whether the seeded profile should be the default for new members';

