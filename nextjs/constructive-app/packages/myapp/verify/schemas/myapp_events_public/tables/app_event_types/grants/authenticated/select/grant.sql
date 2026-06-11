-- Verify: schemas/myapp_events_public/tables/app_event_types/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_events_public.app_event_types', 'select', 'authenticated');


