-- Verify: schemas/myapp_events_public/tables/org_levels/grants/authenticated/update/grant


SELECT verify_table_grant('myapp_events_public.org_levels', 'update', 'authenticated');


