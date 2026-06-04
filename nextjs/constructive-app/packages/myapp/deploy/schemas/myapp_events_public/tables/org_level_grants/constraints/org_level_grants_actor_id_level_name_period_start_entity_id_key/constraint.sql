-- Deploy: schemas/myapp_events_public/tables/org_level_grants/constraints/org_level_grants_actor_id_level_name_period_start_entity_id_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/org_level_grants/table


ALTER TABLE myapp_events_public.org_level_grants 
  ADD CONSTRAINT org_level_grants_actor_id_level_name_period_start_entity_id_key 
    UNIQUE (actor_id, level_name, period_start, entity_id);

