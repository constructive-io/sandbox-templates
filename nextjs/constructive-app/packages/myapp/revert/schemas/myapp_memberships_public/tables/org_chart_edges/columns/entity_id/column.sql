-- Revert: schemas/myapp_memberships_public/tables/org_chart_edges/columns/entity_id/column


ALTER TABLE myapp_memberships_public.org_chart_edges 
  DROP COLUMN entity_id RESTRICT;


