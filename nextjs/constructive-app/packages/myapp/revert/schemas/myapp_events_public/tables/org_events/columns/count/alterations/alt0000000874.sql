-- Revert: schemas/myapp_events_public/tables/org_events/columns/count/alterations/alt0000000874


ALTER TABLE myapp_events_public.org_events 
  ALTER COLUMN count DROP DEFAULT;


