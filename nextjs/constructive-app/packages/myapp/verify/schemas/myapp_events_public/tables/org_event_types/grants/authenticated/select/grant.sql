-- Verify: schemas/myapp_events_public/tables/org_event_types/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_events_public.org_event_types', 'select', 'authenticated');


