-- Verify: schemas/myapp_events_public/tables/app_level_requirements/grants/authenticated/delete/grant


SELECT verify_table_grant('myapp_events_public.app_level_requirements', 'delete', 'authenticated');


