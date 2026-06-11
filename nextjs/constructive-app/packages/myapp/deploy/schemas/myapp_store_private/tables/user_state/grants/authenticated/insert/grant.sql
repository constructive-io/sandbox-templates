-- Deploy: schemas/myapp_store_private/tables/user_state/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/user_state/table


GRANT INSERT ON myapp_store_private.user_state TO authenticated;

