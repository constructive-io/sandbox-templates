-- Verify: schemas/myapp_store_public/tables/app_config/policies/auth_del_app_mem/policy


SELECT verify_policy('auth_del_app_mem', 'myapp_store_public.app_config');


