-- Verify: schemas/myapp_events_public/tables/app_levels/indexes/app_levels_updated_at_idx


SELECT verify_index('myapp_events_public.app_levels', 'app_levels_updated_at_idx');


