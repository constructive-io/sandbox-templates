-- Revert: schemas/myapp_store_private/tables/app_secrets/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_store_private.app_secrets FROM authenticated;


