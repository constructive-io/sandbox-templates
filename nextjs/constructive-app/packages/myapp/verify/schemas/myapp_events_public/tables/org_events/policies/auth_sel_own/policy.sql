-- Verify: schemas/myapp_events_public/tables/org_events/policies/auth_sel_own/policy


SELECT verify_policy('auth_sel_own', 'myapp_events_public.org_events');


