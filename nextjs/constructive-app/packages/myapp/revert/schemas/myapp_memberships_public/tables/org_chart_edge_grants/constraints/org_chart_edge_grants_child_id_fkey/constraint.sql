-- Revert: schemas/myapp_memberships_public/tables/org_chart_edge_grants/constraints/org_chart_edge_grants_child_id_fkey/constraint


ALTER TABLE myapp_memberships_public.org_chart_edge_grants 
  DROP CONSTRAINT org_chart_edge_grants_child_id_fkey;


