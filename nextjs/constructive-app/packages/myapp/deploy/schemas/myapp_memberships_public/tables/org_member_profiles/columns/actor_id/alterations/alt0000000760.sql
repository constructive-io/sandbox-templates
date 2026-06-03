-- Deploy: schemas/myapp_memberships_public/tables/org_member_profiles/columns/actor_id/alterations/alt0000000760
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_member_profiles/columns/actor_id/column


COMMENT ON COLUMN myapp_memberships_public.org_member_profiles.actor_id IS E'References the user who owns this profile (for self-edit RLS)';

