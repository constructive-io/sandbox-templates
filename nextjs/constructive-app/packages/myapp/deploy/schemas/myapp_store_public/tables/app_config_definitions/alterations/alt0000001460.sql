-- Deploy: schemas/myapp_store_public/tables/app_config_definitions/alterations/alt0000001460
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config_definitions/table


COMMENT ON TABLE myapp_store_public.app_config_definitions IS E'Registry of valid config keys — declares which config entries the platform recognizes';

