-- Revert: schemas/myapp_auth_private/views/user_api_keys/grants/authenticated/SELECT/grant


REVOKE SELECT ON myapp_auth_private.user_api_keys FROM authenticated;


