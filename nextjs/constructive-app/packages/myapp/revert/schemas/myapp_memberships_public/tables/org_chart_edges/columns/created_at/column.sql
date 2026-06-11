-- Revert: schemas/myapp_memberships_public/tables/org_chart_edges/columns/created_at/column


ALTER TABLE myapp_memberships_public.org_chart_edges 
  DROP COLUMN created_at RESTRICT;


