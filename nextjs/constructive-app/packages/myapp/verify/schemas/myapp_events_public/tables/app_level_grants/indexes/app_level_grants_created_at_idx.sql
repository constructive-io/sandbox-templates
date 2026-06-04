-- Verify: schemas/myapp_events_public/tables/app_level_grants/indexes/app_level_grants_created_at_idx


SELECT verify_index('myapp_events_public.app_level_grants', 'app_level_grants_created_at_idx');


