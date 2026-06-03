-- Deploy: schemas/myapp_memberships_public/tables/org_grants/columns/actor_id/alterations/alt0000000781
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_grants/columns/actor_id/column


COMMENT ON COLUMN myapp_memberships_public.org_grants.actor_id IS 'The member receiving or losing the permission grant';

