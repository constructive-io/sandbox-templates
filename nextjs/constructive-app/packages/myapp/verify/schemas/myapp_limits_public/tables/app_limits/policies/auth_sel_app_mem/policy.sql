-- Verify: schemas/myapp_limits_public/tables/app_limits/policies/auth_sel_app_mem/policy


SELECT verify_policy('auth_sel_app_mem', 'myapp_limits_public.app_limits');


