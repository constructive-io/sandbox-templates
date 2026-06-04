-- Verify: schemas/myapp_events_public/tables/org_events/indexes/org_events_entity_id_idx


SELECT verify_index('myapp_events_public.org_events', 'org_events_entity_id_idx');


