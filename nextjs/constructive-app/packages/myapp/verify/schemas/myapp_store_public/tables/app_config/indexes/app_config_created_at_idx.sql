-- Verify: schemas/myapp_store_public/tables/app_config/indexes/app_config_created_at_idx


SELECT verify_index('myapp_store_public.app_config', 'app_config_created_at_idx');


