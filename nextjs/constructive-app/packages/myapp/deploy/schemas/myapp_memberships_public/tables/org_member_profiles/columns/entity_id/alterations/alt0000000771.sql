-- Deploy: schemas/myapp_memberships_public/tables/org_member_profiles/columns/entity_id/alterations/alt0000000771
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_member_profiles/columns/entity_id/column


COMMENT ON COLUMN myapp_memberships_public.org_member_profiles.entity_id IS E'References the entity this profile belongs to (used for RLS lookups)';

