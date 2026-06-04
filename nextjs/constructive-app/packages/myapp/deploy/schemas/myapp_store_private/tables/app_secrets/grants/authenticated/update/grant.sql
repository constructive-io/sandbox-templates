-- Deploy: schemas/myapp_store_private/tables/app_secrets/grants/authenticated/update/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_private/schema
-- requires: schemas/myapp_store_private/tables/app_secrets/table


GRANT UPDATE ON myapp_store_private.app_secrets TO authenticated;

