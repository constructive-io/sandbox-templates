-- Revert: schemas/myapp_events_public/tables/org_event_types/columns/is_active/column


ALTER TABLE myapp_events_public.org_event_types 
  DROP COLUMN is_active RESTRICT;


