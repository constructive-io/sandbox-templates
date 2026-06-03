-- Revert: schemas/myapp_events_public/tables/app_level_grants/columns/actor_id/column


ALTER TABLE myapp_events_public.app_level_grants 
  DROP COLUMN actor_id RESTRICT;


