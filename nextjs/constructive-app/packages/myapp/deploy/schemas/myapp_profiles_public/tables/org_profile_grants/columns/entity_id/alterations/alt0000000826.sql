-- Deploy: schemas/myapp_profiles_public/tables/org_profile_grants/columns/entity_id/alterations/alt0000000826
-- made with <3 @ constructive.io

-- requires: schemas/myapp_profiles_public/schema
-- requires: schemas/myapp_profiles_public/tables/org_profile_grants/columns/entity_id/column


COMMENT ON COLUMN myapp_profiles_public.org_profile_grants.entity_id IS E'The entity (org or group) scope for this profile grant';

