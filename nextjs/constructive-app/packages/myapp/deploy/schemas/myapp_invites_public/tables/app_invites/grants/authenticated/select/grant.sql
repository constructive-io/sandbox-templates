-- Deploy: schemas/myapp_invites_public/tables/app_invites/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table


GRANT SELECT ON myapp_invites_public.app_invites TO authenticated;

