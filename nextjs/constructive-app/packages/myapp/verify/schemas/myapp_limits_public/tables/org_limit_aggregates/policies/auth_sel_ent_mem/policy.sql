-- Verify: schemas/myapp_limits_public/tables/org_limit_aggregates/policies/auth_sel_ent_mem/policy


SELECT verify_policy('auth_sel_ent_mem', 'myapp_limits_public.org_limit_aggregates');


