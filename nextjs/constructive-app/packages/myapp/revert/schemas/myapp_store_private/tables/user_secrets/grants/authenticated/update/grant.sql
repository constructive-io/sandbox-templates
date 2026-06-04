-- Revert: schemas/myapp_store_private/tables/user_secrets/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_store_private.user_secrets FROM authenticated;


