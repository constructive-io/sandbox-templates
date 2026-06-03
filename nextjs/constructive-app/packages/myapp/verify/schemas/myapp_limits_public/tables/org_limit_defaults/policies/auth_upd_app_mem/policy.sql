-- Verify: schemas/myapp_limits_public/tables/org_limit_defaults/policies/auth_upd_app_mem/policy


SELECT verify_policy('auth_upd_app_mem', 'myapp_limits_public.org_limit_defaults');


