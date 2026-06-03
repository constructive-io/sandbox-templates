-- Verify: schemas/myapp_events_public/tables/app_events/indexes/app_events_actor_id_name_idx


SELECT verify_index('myapp_events_public.app_events', 'app_events_actor_id_name_idx');


