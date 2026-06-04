-- Revert: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/child_id/alterations/alt0000001017


ALTER TABLE myapp_memberships_public.org_chart_edge_grants 
  ALTER COLUMN child_id DROP NOT NULL;


