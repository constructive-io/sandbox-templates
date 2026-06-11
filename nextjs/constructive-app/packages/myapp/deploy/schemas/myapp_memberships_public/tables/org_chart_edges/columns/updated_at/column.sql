-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edges/columns/updated_at/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/table


ALTER TABLE myapp_memberships_public.org_chart_edges 
  ADD COLUMN updated_at timestamptz;

