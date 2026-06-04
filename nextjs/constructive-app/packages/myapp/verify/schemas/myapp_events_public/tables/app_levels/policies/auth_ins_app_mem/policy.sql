-- Verify: schemas/myapp_events_public/tables/app_levels/policies/auth_ins_app_mem/policy


SELECT verify_policy('auth_ins_app_mem', 'myapp_events_public.app_levels');


