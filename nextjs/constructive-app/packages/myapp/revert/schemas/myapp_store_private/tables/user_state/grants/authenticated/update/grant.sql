-- Revert: schemas/myapp_store_private/tables/user_state/grants/authenticated/update/grant


REVOKE UPDATE ON myapp_store_private.user_state FROM authenticated;


