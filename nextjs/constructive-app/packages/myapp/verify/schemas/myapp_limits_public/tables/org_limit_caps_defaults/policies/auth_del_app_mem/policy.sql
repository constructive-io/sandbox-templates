-- Verify: schemas/myapp_limits_public/tables/org_limit_caps_defaults/policies/auth_del_app_mem/policy


SELECT verify_policy('auth_del_app_mem', 'myapp_limits_public.org_limit_caps_defaults');


