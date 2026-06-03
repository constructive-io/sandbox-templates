-- Revert: schemas/myapp_events_public/tables/org_event_types/columns/id/column


ALTER TABLE myapp_events_public.org_event_types 
  DROP COLUMN id RESTRICT;


