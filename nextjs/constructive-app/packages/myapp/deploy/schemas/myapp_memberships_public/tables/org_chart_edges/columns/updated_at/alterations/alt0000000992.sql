-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edges/columns/updated_at/alterations/alt0000000992
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/table
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/columns/updated_at/column


ALTER TABLE myapp_memberships_public.org_chart_edges 
  ALTER COLUMN updated_at SET DEFAULT now();

