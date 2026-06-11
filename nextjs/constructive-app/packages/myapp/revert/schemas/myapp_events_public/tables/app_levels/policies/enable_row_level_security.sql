-- Revert: schemas/myapp_events_public/tables/app_levels/policies/enable_row_level_security


ALTER TABLE myapp_events_public.app_levels 
  DISABLE ROW LEVEL SECURITY;


