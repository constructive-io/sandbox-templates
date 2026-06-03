-- Revert: schemas/myapp_events_public/tables/org_event_types/columns/is_milestone/alterations/alt0000000908


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN is_milestone DROP NOT NULL;


