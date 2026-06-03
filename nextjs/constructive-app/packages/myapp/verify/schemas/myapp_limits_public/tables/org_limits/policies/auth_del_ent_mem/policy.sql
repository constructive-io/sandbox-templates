-- Verify: schemas/myapp_limits_public/tables/org_limits/policies/auth_del_ent_mem/policy


SELECT verify_policy('auth_del_ent_mem', 'myapp_limits_public.org_limits');


