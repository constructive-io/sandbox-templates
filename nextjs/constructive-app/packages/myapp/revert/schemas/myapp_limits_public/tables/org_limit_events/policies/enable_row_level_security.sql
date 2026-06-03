-- Revert: schemas/myapp_limits_public/tables/org_limit_events/policies/enable_row_level_security


ALTER TABLE myapp_limits_public.org_limit_events 
  DISABLE ROW LEVEL SECURITY;


