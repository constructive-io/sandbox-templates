-- Deploy: schemas/myapp_store_private/tables/app_secrets/grants/authenticated/insert/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table


GRANT INSERT ON myapp_store_private.app_secrets TO authenticated;

