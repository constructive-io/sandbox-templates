-- Revert: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/position_title/column


ALTER TABLE myapp_memberships_public.org_chart_edge_grants 
  DROP COLUMN position_title RESTRICT;


