-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/columns/name/column


ALTER TABLE myapp_events_public.org_event_aggregates 
  DROP COLUMN name RESTRICT;


