-- Revert: schemas/myapp_events_public/tables/org_levels/policies/enable_row_level_security


ALTER TABLE myapp_events_public.org_levels 
  DISABLE ROW LEVEL SECURITY;


