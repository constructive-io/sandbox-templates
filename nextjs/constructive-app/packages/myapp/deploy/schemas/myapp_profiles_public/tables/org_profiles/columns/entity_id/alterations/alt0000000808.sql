-- Deploy: schemas/myapp_profiles_public/tables/org_profiles/columns/entity_id/alterations/alt0000000808
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profiles/columns/entity_id/column


COMMENT ON COLUMN myapp_profiles_public.org_profiles.entity_id IS E'Scopes this profile to a specific entity; NULL means it is a global profile';

