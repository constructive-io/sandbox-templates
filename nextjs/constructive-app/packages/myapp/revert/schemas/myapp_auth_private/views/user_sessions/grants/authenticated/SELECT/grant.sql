-- Revert: schemas/myapp_auth_private/views/user_sessions/grants/authenticated/SELECT/grant


REVOKE SELECT ON myapp_auth_private.user_sessions FROM authenticated;


