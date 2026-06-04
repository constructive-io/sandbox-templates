-- Revert: schemas/myapp_events_public/tables/app_level_grants/policies/enable_row_level_security


ALTER TABLE myapp_events_public.app_level_grants 
  DISABLE ROW LEVEL SECURITY;


