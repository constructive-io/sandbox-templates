-- Revert: schemas/myapp_store_private/tables/app_secrets/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_store_private.app_secrets FROM authenticated;


