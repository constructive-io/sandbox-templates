-- Revert: schemas/myapp_store_private/tables/user_secrets/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_store_private.user_secrets FROM authenticated;


