-- Verify: schemas/myapp_store_private/tables/user_secrets/policies/auth_del_dir_own/policy


SELECT verify_policy('auth_del_dir_own', 'myapp_store_private.user_secrets');


