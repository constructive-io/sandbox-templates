-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table


GRANT DELETE ON myapp_memberships_public.org_memberships TO authenticated;

