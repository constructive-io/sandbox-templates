-- Revert: schemas/myapp_events_public/tables/app_events/columns/actor_id/column


ALTER TABLE myapp_events_public.app_events 
  DROP COLUMN actor_id RESTRICT;


