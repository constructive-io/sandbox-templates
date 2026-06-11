-- Verify: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/policies/auth_ins_ent_mem/policy


SELECT verify_policy('auth_ins_ent_mem', 'myapp_limits_public.app_limit_credit_redemptions');


