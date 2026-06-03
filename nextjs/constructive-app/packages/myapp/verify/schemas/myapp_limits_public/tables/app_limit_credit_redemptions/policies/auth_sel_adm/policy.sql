-- Verify: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/policies/auth_sel_adm/policy


SELECT verify_policy('auth_sel_adm', 'myapp_limits_public.app_limit_credit_redemptions');


