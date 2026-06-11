-- Revert: schemas/myapp_events_public/tables/org_events/columns/organization_id/column


ALTER TABLE myapp_events_public.org_events 
  DROP COLUMN organization_id RESTRICT;


