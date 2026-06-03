-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/columns/name/alterations/alt0000000885


ALTER TABLE myapp_events_public.org_event_aggregates 
  ALTER COLUMN name DROP NOT NULL;


