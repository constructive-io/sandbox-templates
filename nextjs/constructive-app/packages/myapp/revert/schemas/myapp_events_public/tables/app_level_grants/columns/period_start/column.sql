-- Revert: schemas/myapp_events_public/tables/app_level_grants/columns/period_start/column


ALTER TABLE myapp_events_public.app_level_grants 
  DROP COLUMN period_start RESTRICT;


