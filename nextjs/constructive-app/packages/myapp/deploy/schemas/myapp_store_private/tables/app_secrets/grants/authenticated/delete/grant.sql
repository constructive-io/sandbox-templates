-- Deploy: schemas/myapp_store_private/tables/app_secrets/grants/authenticated/delete/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table


GRANT DELETE ON myapp_store_private.app_secrets TO authenticated;

