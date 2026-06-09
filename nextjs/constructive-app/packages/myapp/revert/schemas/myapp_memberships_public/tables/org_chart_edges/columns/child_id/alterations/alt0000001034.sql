-- Revert: schemas/myapp_memberships_public/tables/org_chart_edges/columns/child_id/alterations/alt0000001034


ALTER TABLE myapp_memberships_public.org_chart_edges 
  DROP CONSTRAINT org_chart_edges_child_id_parent_id_chk;


