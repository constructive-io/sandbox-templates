-- Deploy: schemas/myapp_store_public/tables/app_config/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/table


GRANT SELECT ON myapp_store_public.app_config TO authenticated;

