-- Revert: schemas/myapp_events_public/tables/app_events/columns/actor_id/alterations/alt0000000288


ALTER TABLE myapp_events_public.app_events 
  ALTER COLUMN actor_id DROP DEFAULT;


