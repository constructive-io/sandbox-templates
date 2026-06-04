-- Deploy: schemas/myapp_store_public/tables/app_config/indexes/app_config_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config/table
-- requires: schemas/myapp_store_public/tables/app_config/columns/updated_at/column


CREATE INDEX app_config_updated_at_idx ON myapp_store_public.app_config ( updated_at );

