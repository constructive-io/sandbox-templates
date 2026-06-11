-- Deploy: schemas/myapp_memberships_public/tables/org_owner_grants/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_owner_grants/table


GRANT INSERT ON myapp_memberships_public.org_owner_grants TO authenticated;

