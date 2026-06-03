-- Revert: schemas/myapp_events_public/tables/org_event_types/columns/period_interval/column


ALTER TABLE myapp_events_public.org_event_types 
  DROP COLUMN period_interval RESTRICT;


