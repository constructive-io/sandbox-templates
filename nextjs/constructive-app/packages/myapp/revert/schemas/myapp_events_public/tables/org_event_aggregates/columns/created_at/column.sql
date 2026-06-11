-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/columns/created_at/column


ALTER TABLE myapp_events_public.org_event_aggregates 
  DROP COLUMN created_at RESTRICT;


