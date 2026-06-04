-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/columns/is_system/alterations/alt0000000802
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/columns/is_system/column


COMMENT ON COLUMN myapp_profiles_public.org_profiles.is_system IS E'System profiles are built-in and cannot be deleted or renamed by users';

