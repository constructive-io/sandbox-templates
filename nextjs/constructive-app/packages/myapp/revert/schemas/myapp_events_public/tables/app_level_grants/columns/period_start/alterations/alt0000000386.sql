-- Revert: schemas/myapp_events_public/tables/app_level_grants/columns/period_start/alterations/alt0000000386


ALTER TABLE myapp_events_public.app_level_grants 
  ALTER COLUMN period_start DROP DEFAULT;


