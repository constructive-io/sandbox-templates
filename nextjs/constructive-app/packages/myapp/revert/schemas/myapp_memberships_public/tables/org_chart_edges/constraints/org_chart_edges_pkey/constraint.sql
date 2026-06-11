-- Revert: schemas/myapp_memberships_public/tables/org_chart_edges/constraints/org_chart_edges_pkey/constraint


ALTER TABLE myapp_memberships_public.org_chart_edges 
  DROP CONSTRAINT org_chart_edges_pkey;


