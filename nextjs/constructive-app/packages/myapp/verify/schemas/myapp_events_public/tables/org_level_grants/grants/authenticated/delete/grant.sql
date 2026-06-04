-- Verify: schemas/myapp_events_public/tables/org_level_grants/grants/authenticated/delete/grant


SELECT verify_table_grant('myapp_events_public.org_level_grants', 'delete', 'authenticated');


