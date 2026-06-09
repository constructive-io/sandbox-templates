-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/id/alterations/alt0000001048
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edge_grants/table
-- requires: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/id/column


ALTER TABLE myapp_memberships_public.org_chart_edge_grants 
  ALTER COLUMN id SET DEFAULT uuidv7();

