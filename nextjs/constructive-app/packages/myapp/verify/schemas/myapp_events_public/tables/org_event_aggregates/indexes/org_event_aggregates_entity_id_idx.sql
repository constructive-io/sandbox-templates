-- Verify: schemas/myapp_events_public/tables/org_event_aggregates/indexes/org_event_aggregates_entity_id_idx


SELECT verify_index('myapp_events_public.org_event_aggregates', 'org_event_aggregates_entity_id_idx');


