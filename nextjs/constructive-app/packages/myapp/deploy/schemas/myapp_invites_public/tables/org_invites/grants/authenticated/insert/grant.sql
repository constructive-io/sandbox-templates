-- Deploy: schemas/myapp_invites_public/tables/org_invites/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_invites_public/schema
-- requires: schemas/myapp_invites_public/tables/org_invites/table


GRANT INSERT (channel, email, phone, expires_at, multiple, invite_limit, entity_id, receiver_id, profile_id, is_read_only) ON myapp_invites_public.org_invites TO authenticated;

