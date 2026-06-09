-- Revert: schemas/myapp_invites_public/tables/app_invites/grants/authenticated/insert/grant


REVOKE INSERT (channel, email, phone, expires_at, multiple, invite_limit, profile_id) ON myapp_invites_public.app_invites FROM authenticated;


