-- Verify: schemas/myapp_events_public/tables/org_event_aggregates/grants/authenticated/insert/grant


SELECT verify_table_grant('myapp_events_public.org_event_aggregates', 'insert', 'authenticated');


