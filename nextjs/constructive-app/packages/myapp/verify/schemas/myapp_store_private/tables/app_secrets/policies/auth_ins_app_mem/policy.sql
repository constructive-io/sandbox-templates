-- Verify: schemas/myapp_store_private/tables/app_secrets/policies/auth_ins_app_mem/policy


SELECT verify_policy('auth_ins_app_mem', 'myapp_store_private.app_secrets');


