-- Revert: schemas/myapp_events_public/tables/app_level_grants/columns/id/alterations/alt0000000363


ALTER TABLE myapp_events_public.app_level_grants 
  ALTER COLUMN id DROP DEFAULT;


