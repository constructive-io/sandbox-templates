-- Revert: schemas/myapp_events_public/tables/app_events/columns/count/alterations/alt0000000292


ALTER TABLE myapp_events_public.app_events 
  ALTER COLUMN count DROP DEFAULT;


