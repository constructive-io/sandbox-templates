-- Deploy: schemas/myapp_memberships_public/tables/org_grants/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_grants/table


GRANT SELECT ON myapp_memberships_public.org_grants TO authenticated;

