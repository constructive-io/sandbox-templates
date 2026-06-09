-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/columns/count/alterations/alt0000000921


ALTER TABLE myapp_events_public.org_event_aggregates 
  ALTER COLUMN count DROP DEFAULT;


