-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table


GRANT INSERT (actor_id, entity_id) ON myapp_memberships_public.org_memberships TO authenticated;

