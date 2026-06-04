-- Revert: schemas/myapp_events_public/tables/app_event_aggregates/policies/enable_row_level_security


ALTER TABLE myapp_events_public.app_event_aggregates 
  DISABLE ROW LEVEL SECURITY;


