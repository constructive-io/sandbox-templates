-- Verify: schemas/myapp_store_public/tables/app_config_definitions/indexes/app_config_definitions_created_at_idx


SELECT verify_index('myapp_store_public.app_config_definitions', 'app_config_definitions_created_at_idx');


