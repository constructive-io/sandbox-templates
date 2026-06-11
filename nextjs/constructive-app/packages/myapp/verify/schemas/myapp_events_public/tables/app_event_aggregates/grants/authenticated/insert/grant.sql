-- Verify: schemas/myapp_events_public/tables/app_event_aggregates/grants/authenticated/insert/grant


SELECT verify_table_grant('myapp_events_public.app_event_aggregates', 'insert', 'authenticated');


