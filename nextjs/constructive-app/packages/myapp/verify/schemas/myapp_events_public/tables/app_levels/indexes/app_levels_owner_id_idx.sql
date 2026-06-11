-- Verify: schemas/myapp_events_public/tables/app_levels/indexes/app_levels_owner_id_idx


SELECT verify_index('myapp_events_public.app_levels', 'app_levels_owner_id_idx');


