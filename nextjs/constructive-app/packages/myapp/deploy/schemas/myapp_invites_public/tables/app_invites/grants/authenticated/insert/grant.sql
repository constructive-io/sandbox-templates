-- Deploy: schemas/myapp_invites_public/tables/app_invites/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/app_invites/table


GRANT INSERT (email, expires_at, multiple, invite_limit, profile_id) ON myapp_invites_public.app_invites TO authenticated;

