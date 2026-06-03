-- Revert: schemas/myapp_events_public/tables/app_events/columns/id/column


ALTER TABLE myapp_events_public.app_events 
  DROP COLUMN id RESTRICT;


