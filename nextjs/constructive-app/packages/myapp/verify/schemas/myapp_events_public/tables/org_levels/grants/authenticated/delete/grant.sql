-- Verify: schemas/myapp_events_public/tables/org_levels/grants/authenticated/delete/grant


SELECT verify_table_grant('myapp_events_public.org_levels', 'delete', 'authenticated');


