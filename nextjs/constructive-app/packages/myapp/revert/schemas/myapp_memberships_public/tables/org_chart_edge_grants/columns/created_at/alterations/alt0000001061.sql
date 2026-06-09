-- Revert: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/created_at/alterations/alt0000001061


ALTER TABLE myapp_memberships_public.org_chart_edge_grants 
  ALTER COLUMN created_at DROP DEFAULT;


