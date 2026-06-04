-- Revert: schemas/myapp_invites_public/tables/org_invites/grants/authenticated/insert/grant


REVOKE INSERT (email, expires_at, multiple, invite_limit, entity_id, receiver_id, profile_id, is_read_only) ON myapp_invites_public.org_invites FROM authenticated;


