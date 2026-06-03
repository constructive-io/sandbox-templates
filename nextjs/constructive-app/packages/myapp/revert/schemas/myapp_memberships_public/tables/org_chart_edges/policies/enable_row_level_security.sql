-- Revert: schemas/myapp_memberships_public/tables/org_chart_edges/policies/enable_row_level_security


ALTER TABLE myapp_memberships_public.org_chart_edges 
  DISABLE ROW LEVEL SECURITY;


