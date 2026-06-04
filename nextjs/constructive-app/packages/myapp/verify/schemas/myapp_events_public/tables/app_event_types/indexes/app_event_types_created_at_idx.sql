-- Verify: schemas/myapp_events_public/tables/app_event_types/indexes/app_event_types_created_at_idx


SELECT verify_index('myapp_events_public.app_event_types', 'app_event_types_created_at_idx');


