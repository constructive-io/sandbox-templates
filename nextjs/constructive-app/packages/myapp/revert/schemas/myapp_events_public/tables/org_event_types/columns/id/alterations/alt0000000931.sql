-- Revert: schemas/myapp_events_public/tables/org_event_types/columns/id/alterations/alt0000000931


ALTER TABLE myapp_events_public.org_event_types 
  ALTER COLUMN id DROP NOT NULL;


