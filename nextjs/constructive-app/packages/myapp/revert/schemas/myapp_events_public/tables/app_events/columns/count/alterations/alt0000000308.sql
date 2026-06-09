-- Revert: schemas/myapp_events_public/tables/app_events/columns/count/alterations/alt0000000308


ALTER TABLE myapp_events_public.app_events 
  ALTER COLUMN count DROP NOT NULL;


