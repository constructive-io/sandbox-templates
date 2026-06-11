-- Deploy: schemas/myapp_memberships_public/tables/org_membership_defaults/grants/authenticated/update/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_membership_defaults/table


GRANT UPDATE ON myapp_memberships_public.org_membership_defaults TO authenticated;

