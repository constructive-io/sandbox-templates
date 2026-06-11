-- Verify: schemas/myapp_events_public/tables/app_event_types/policies/auth_del_app_mem/policy


SELECT verify_policy('auth_del_app_mem', 'myapp_events_public.app_event_types');


