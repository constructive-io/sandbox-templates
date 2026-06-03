-- Revert: schemas/myapp_events_public/tables/app_event_types/policies/enable_row_level_security


ALTER TABLE myapp_events_public.app_event_types 
  DISABLE ROW LEVEL SECURITY;


