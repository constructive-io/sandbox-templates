-- Verify: schemas/myapp_limits_public/tables/org_limit_aggregates/policies/auth_ins_admin/policy


SELECT verify_policy('auth_ins_admin', 'myapp_limits_public.org_limit_aggregates');


