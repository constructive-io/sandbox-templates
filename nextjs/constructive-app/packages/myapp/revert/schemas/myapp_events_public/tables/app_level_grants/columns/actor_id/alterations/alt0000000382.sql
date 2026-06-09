-- Revert: schemas/myapp_events_public/tables/app_level_grants/columns/actor_id/alterations/alt0000000382


ALTER TABLE myapp_events_public.app_level_grants 
  ALTER COLUMN actor_id DROP DEFAULT;


