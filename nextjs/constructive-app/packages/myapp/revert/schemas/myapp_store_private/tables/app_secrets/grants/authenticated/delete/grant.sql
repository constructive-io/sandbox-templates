-- Revert: schemas/myapp_store_private/tables/app_secrets/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_store_private.app_secrets FROM authenticated;


