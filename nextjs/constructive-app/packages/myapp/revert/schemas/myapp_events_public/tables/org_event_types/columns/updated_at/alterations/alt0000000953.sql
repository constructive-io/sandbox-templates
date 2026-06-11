-- Revert: schemas/myapp_events_public/tables/org_event_types/columns/updated_at/alterations/alt0000000953


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN updated_at DROP DEFAULT;


