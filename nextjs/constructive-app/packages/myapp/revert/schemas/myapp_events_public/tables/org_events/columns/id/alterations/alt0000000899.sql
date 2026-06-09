-- Revert: schemas/myapp_events_public/tables/org_events/columns/id/alterations/alt0000000899


ALTER TABLE myapp_events_public.org_events 
  ALTER COLUMN id DROP NOT NULL;


