-- Revert: schemas/myapp_memberships_public/tables/org_chart_edges/columns/child_id/alterations/alt0000000995


ALTER TABLE myapp_memberships_public.org_chart_edges 
  ALTER COLUMN child_id DROP NOT NULL;


