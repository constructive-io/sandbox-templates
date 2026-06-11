-- Revert: schemas/myapp_events_public/tables/org_events/policies/enable_row_level_security


ALTER TABLE myapp_events_public.org_events 
  DISABLE ROW LEVEL SECURITY;


