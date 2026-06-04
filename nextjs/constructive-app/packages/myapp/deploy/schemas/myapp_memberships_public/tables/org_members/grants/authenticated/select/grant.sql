-- Deploy: schemas/myapp_memberships_public/tables/org_members/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_members/table


GRANT SELECT ON myapp_memberships_public.org_members TO authenticated;

