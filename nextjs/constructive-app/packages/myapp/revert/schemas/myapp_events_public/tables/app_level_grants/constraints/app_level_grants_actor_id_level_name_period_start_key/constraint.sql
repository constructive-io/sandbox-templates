-- Revert: schemas/myapp_events_public/tables/app_level_grants/constraints/app_level_grants_actor_id_level_name_period_start_key/constraint


ALTER TABLE myapp_events_public.app_level_grants 
  DROP CONSTRAINT app_level_grants_actor_id_level_name_period_start_key;


