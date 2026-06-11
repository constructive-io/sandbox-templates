-- Revert: schemas/myapp_events_public/tables/org_events/columns/name/column


ALTER TABLE myapp_events_public.org_events 
  DROP COLUMN name RESTRICT;


