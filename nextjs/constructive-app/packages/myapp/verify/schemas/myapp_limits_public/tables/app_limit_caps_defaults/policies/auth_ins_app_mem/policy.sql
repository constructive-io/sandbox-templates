-- Verify: schemas/myapp_limits_public/tables/app_limit_caps_defaults/policies/auth_ins_app_mem/policy


SELECT verify_policy('auth_ins_app_mem', 'myapp_limits_public.app_limit_caps_defaults');


