-- Verify: schemas/myapp_users_public/tables/users/policies/auth_del_com/policy


SELECT verify_policy('auth_del_com', 'myapp_users_public.users');


