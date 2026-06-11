-- Revert: schemas/myapp_events_public/tables/app_events/policies/enable_row_level_security


ALTER TABLE myapp_events_public.app_events 
  DISABLE ROW LEVEL SECURITY;


