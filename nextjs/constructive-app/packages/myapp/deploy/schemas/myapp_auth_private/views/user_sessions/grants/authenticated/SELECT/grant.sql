-- Deploy: schemas/myapp_auth_private/views/user_sessions/grants/authenticated/SELECT/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/views/user_sessions/view


GRANT SELECT ON myapp_auth_private.user_sessions TO authenticated;

