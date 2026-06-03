-- Deploy: schemas/myapp_invites_public/tables/org_invites/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table


GRANT DELETE ON myapp_invites_public.org_invites TO authenticated;

