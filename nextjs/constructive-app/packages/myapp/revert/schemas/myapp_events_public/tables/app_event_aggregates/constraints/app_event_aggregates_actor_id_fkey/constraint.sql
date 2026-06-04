-- Revert: schemas/myapp_events_public/tables/app_event_aggregates/constraints/app_event_aggregates_actor_id_fkey/constraint


ALTER TABLE myapp_events_public.app_event_aggregates 
  DROP CONSTRAINT app_event_aggregates_actor_id_fkey;


