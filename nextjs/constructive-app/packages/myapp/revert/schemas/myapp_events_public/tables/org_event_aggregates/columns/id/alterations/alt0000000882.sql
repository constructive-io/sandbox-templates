-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/columns/id/alterations/alt0000000882


ALTER TABLE myapp_events_public.org_event_aggregates 
  ALTER COLUMN id DROP DEFAULT;


