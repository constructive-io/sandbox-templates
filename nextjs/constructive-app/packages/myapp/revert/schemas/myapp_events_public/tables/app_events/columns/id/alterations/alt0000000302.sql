-- Revert: schemas/myapp_events_public/tables/app_events/columns/id/alterations/alt0000000302


ALTER TABLE myapp_events_public.app_events 
  ALTER COLUMN id DROP DEFAULT;


