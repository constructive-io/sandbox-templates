-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edges/columns/id/alterations/alt0000001024
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/table
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/columns/id/column


ALTER TABLE myapp_memberships_public.org_chart_edges 
  ALTER COLUMN id SET DEFAULT uuidv7();

