-- Verify: schemas/myapp_infra_public/tables/app_namespace_events/policies/auth_ins_app_mem/policy


SELECT verify_policy('auth_ins_app_mem', 'myapp_infra_public.app_namespace_events');


