-- Verify: schemas/myapp_events_public/tables/org_level_grants/indexes/org_level_grants_actor_id_idx


SELECT verify_index('myapp_events_public.org_level_grants', 'org_level_grants_actor_id_idx');


