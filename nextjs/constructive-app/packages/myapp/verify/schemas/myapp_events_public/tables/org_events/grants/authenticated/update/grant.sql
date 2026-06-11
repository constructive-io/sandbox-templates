-- Verify: schemas/myapp_events_public/tables/org_events/grants/authenticated/update/grant


SELECT verify_table_grant('myapp_events_public.org_events', 'update', 'authenticated');


