-- Verify: schemas/myapp_users_public/tables/users/policies/auth_upd_com/policy


SELECT verify_policy('auth_upd_com', 'myapp_users_public.users');


