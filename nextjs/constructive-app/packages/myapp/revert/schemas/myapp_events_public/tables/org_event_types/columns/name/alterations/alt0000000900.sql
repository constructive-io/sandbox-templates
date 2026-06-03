-- Revert: schemas/myapp_events_public/tables/org_event_types/columns/name/alterations/alt0000000900


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN name DROP NOT NULL;


