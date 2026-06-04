-- Verify: schemas/myapp_events_public/tables/app_level_requirements/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_events_public.app_level_requirements', 'select', 'authenticated');


