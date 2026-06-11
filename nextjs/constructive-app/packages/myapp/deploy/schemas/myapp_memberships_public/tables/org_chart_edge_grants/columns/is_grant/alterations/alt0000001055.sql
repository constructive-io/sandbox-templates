-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/is_grant/alterations/alt0000001055
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edge_grants/table
-- requires: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/is_grant/column


ALTER TABLE myapp_memberships_public.org_chart_edge_grants 
  ALTER COLUMN is_grant SET NOT NULL;

