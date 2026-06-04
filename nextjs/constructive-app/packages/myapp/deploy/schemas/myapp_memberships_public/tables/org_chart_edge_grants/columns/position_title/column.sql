-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/position_title/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edge_grants/table


ALTER TABLE myapp_memberships_public.org_chart_edge_grants 
  ADD COLUMN position_title text;

