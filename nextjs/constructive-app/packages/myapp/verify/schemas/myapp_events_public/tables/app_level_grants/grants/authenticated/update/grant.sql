-- Verify: schemas/myapp_events_public/tables/app_level_grants/grants/authenticated/update/grant


SELECT verify_table_grant('myapp_events_public.app_level_grants', 'update', 'authenticated');


