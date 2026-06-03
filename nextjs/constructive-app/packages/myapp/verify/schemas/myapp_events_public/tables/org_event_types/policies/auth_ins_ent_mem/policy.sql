-- Verify: schemas/myapp_events_public/tables/org_event_types/policies/auth_ins_ent_mem/policy


SELECT verify_policy('auth_ins_ent_mem', 'myapp_events_public.org_event_types');


