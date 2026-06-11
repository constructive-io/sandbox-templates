-- Deploy: schemas/myapp_events_public/tables/app_level_grants/constraints/app_level_grants_actor_id_level_name_period_start_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_events_public/schema
-- requires: schemas/myapp_events_public/tables/app_level_grants/table


ALTER TABLE myapp_events_public.app_level_grants 
  ADD CONSTRAINT app_level_grants_actor_id_level_name_period_start_key 
    UNIQUE (actor_id, level_name, period_start);

