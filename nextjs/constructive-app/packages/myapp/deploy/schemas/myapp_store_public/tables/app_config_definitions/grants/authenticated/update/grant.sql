-- Deploy: schemas/myapp_store_public/tables/app_config_definitions/grants/authenticated/update/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config_definitions/table


GRANT UPDATE ON myapp_store_public.app_config_definitions TO authenticated;

