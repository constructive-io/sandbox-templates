-- Verify: schemas/myapp_events_public/tables/org_level_grants/policies/auth_sel_own/policy


SELECT verify_policy('auth_sel_own', 'myapp_events_public.org_level_grants');


