-- Verify: schemas/myapp_events_public/tables/app_events/grants/authenticated/update/grant


SELECT verify_table_grant('myapp_events_public.app_events', 'update', 'authenticated');


