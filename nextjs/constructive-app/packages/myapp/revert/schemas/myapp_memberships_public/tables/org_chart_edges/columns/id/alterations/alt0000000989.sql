-- Revert: schemas/myapp_memberships_public/tables/org_chart_edges/columns/id/alterations/alt0000000989


ALTER TABLE myapp_memberships_public.org_chart_edges 
  ALTER COLUMN id DROP NOT NULL;


