-- Revert: schemas/myapp_events_public/tables/org_events/columns/name/alterations/alt0000000871


ALTER TABLE myapp_events_public.org_events 
  ALTER COLUMN name DROP NOT NULL;


