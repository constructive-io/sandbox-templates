-- Revert: schemas/myapp_store_private/tables/user_secrets/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_store_private.user_secrets FROM authenticated;


