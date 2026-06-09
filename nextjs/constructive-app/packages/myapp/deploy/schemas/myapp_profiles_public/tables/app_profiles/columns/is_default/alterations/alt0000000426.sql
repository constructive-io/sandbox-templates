-- Deploy: schemas/myapp_profiles_public/tables/app_profiles/columns/is_default/alterations/alt0000000426
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/app_profiles/columns/is_default/column


COMMENT ON COLUMN myapp_profiles_public.app_profiles.is_default IS 'The default profile is automatically assigned to new members when they join';

