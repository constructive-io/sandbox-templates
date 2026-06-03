-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/columns/description/alterations/alt0000000796
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/columns/description/column


COMMENT ON COLUMN myapp_profiles_public.org_profiles.description IS E'Human-readable description of this profile and its intended use';

