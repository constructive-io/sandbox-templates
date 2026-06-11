-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/columns/actor_id/alterations/alt0000000719
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/columns/actor_id/column


COMMENT ON COLUMN myapp_memberships_public.org_memberships.actor_id IS 'References the user who holds this membership';

