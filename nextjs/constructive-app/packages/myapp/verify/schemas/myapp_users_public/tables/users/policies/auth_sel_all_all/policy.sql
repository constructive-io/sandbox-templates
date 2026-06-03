-- Verify: schemas/myapp_users_public/tables/users/policies/auth_sel_all_all/policy


SELECT verify_policy('auth_sel_all_all', 'myapp_users_public.users');


