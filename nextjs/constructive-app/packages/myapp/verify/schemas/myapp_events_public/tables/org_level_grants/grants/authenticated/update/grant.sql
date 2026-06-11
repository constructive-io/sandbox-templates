-- Verify: schemas/myapp_events_public/tables/org_level_grants/grants/authenticated/update/grant


SELECT verify_table_grant('myapp_events_public.org_level_grants', 'update', 'authenticated');


