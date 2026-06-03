-- Deploy: schemas/myapp_store_public/tables/app_config_definitions/indexes/app_config_definitions_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config_definitions/table
-- requires: schemas/myapp_store_public/tables/app_config_definitions/columns/updated_at/column


CREATE INDEX app_config_definitions_updated_at_idx ON myapp_store_public.app_config_definitions ( updated_at );

