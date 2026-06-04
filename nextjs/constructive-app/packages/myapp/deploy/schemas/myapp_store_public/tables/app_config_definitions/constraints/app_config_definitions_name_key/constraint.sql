-- Deploy: schemas/myapp_store_public/tables/app_config_definitions/constraints/app_config_definitions_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_store_public/schema
-- requires: schemas/myapp_store_public/tables/app_config_definitions/table


ALTER TABLE myapp_store_public.app_config_definitions 
  ADD CONSTRAINT app_config_definitions_name_key 
    UNIQUE (name);

