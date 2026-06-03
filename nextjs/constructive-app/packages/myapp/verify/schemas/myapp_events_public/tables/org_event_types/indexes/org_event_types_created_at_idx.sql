-- Verify: schemas/myapp_events_public/tables/org_event_types/indexes/org_event_types_created_at_idx


SELECT verify_index('myapp_events_public.org_event_types', 'org_event_types_created_at_idx');


