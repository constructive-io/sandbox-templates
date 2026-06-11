-- Verify: schemas/myapp_events_public/tables/app_event_aggregates/grants/authenticated/delete/grant


SELECT verify_table_grant('myapp_events_public.app_event_aggregates', 'delete', 'authenticated');


