-- Revert: schemas/myapp_store_private/tables/user_state/grants/authenticated/delete/grant


REVOKE DELETE ON myapp_store_private.user_state FROM authenticated;


