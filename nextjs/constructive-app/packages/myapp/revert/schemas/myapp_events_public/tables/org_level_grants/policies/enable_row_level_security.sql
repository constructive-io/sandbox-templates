-- Revert: schemas/myapp_events_public/tables/org_level_grants/policies/enable_row_level_security


ALTER TABLE myapp_events_public.org_level_grants 
  DISABLE ROW LEVEL SECURITY;


