-- Revert: schemas/myapp_events_public/tables/org_event_types/columns/is_active/alterations/alt0000000912


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN is_active DROP DEFAULT;


