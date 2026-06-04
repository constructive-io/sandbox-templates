-- Verify: schemas/myapp_users_public/tables/users/policies/auth_del_admin_deletes/policy


SELECT verify_policy('auth_del_admin_deletes', 'myapp_users_public.users');


