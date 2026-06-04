-- Revert: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/id/alterations/alt0000001013


ALTER TABLE myapp_memberships_public.org_chart_edge_grants 
  ALTER COLUMN id DROP NOT NULL;


