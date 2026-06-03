-- Revert: schemas/myapp_limits_public/tables/org_limit_aggregates/policies/enable_row_level_security


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  DISABLE ROW LEVEL SECURITY;


