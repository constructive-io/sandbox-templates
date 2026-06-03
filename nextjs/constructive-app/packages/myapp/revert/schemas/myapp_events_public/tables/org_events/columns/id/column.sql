-- Revert: schemas/myapp_events_public/tables/org_events/columns/id/column


ALTER TABLE myapp_events_public.org_events 
  DROP COLUMN id RESTRICT;


