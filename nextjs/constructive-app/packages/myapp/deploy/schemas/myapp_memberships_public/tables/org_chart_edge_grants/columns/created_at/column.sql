-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edge_grants/table


ALTER TABLE myapp_memberships_public.org_chart_edge_grants 
  ADD COLUMN created_at timestamptz;

