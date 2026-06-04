-- Revert: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/is_grant/alterations/alt0000001021


ALTER TABLE myapp_memberships_public.org_chart_edge_grants 
  ALTER COLUMN is_grant DROP NOT NULL;


