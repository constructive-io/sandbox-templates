-- Verify: schemas/myapp_limits_public/tables/app_limit_credits/policies/auth_sel_own/policy


SELECT verify_policy('auth_sel_own', 'myapp_limits_public.app_limit_credits');


