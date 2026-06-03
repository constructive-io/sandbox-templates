-- Deploy: schemas/myapp_store_private/tables/user_state/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_state/table


GRANT DELETE ON myapp_store_private.user_state TO authenticated;

