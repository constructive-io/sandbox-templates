-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/columns/created_at/alterations/alt0000000927


ALTER TABLE myapp_events_public.org_event_aggregates 
  ALTER COLUMN created_at DROP DEFAULT;


