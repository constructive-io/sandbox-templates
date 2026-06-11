-- Verify: schemas/myapp_events_public/tables/app_event_aggregates/indexes/app_event_aggregates_updated_at_idx


SELECT verify_index('myapp_events_public.app_event_aggregates', 'app_event_aggregates_updated_at_idx');


