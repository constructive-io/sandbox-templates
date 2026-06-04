-- Revert: schemas/myapp_events_public/tables/app_event_aggregates/columns/actor_id/column


ALTER TABLE myapp_events_public.app_event_aggregates 
  DROP COLUMN actor_id RESTRICT;


