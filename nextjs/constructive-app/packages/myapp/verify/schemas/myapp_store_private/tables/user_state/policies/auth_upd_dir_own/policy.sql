-- Verify: schemas/myapp_store_private/tables/user_state/policies/auth_upd_dir_own/policy


SELECT verify_policy('auth_upd_dir_own', 'myapp_store_private.user_state');


