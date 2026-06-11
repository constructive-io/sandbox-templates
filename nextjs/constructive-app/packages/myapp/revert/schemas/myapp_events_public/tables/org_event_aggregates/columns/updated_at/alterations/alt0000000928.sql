-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/columns/updated_at/alterations/alt0000000928


ALTER TABLE myapp_events_public.org_event_aggregates 
  ALTER COLUMN updated_at DROP DEFAULT;


