-- Revert: schemas/myapp_events_public/tables/app_event_aggregates/columns/actor_id/alterations/alt0000000299


ALTER TABLE myapp_events_public.app_event_aggregates 
  ALTER COLUMN actor_id DROP DEFAULT;


