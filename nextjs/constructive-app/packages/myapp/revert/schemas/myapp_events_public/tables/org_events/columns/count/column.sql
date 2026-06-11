-- Revert: schemas/myapp_events_public/tables/org_events/columns/count/column


ALTER TABLE myapp_events_public.org_events 
  DROP COLUMN count RESTRICT;


