-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/columns/organization_id/column


ALTER TABLE myapp_events_public.org_event_aggregates 
  DROP COLUMN organization_id RESTRICT;


