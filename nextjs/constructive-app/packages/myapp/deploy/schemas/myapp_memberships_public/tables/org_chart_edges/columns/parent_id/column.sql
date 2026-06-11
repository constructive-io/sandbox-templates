-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edges/columns/parent_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/table


ALTER TABLE myapp_memberships_public.org_chart_edges 
  ADD COLUMN parent_id uuid;

