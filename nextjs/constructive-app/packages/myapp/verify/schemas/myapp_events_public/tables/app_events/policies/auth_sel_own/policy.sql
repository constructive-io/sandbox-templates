-- Verify: schemas/myapp_events_public/tables/app_events/policies/auth_sel_own/policy


SELECT verify_policy('auth_sel_own', 'myapp_events_public.app_events');


