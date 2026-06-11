-- Verify: schemas/myapp_events_public/tables/app_levels/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_events_public.app_levels', 'select', 'authenticated');


