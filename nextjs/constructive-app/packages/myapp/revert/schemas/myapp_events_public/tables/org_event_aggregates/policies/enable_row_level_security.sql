-- Revert: schemas/myapp_events_public/tables/org_event_aggregates/policies/enable_row_level_security


ALTER TABLE myapp_events_public.org_event_aggregates 
  DISABLE ROW LEVEL SECURITY;


