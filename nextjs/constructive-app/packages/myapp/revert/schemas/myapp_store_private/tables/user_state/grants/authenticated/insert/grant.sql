-- Revert: schemas/myapp_store_private/tables/user_state/grants/authenticated/insert/grant


REVOKE INSERT ON myapp_store_private.user_state FROM authenticated;


