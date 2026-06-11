-- Verify: schemas/myapp_events_public/tables/org_level_requirements/policies/auth_upd_ent_mem/policy


SELECT verify_policy('auth_upd_ent_mem', 'myapp_events_public.org_level_requirements');


