-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edges/columns/entity_id/alterations/alt0000000993
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/table
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/columns/entity_id/column


ALTER TABLE myapp_memberships_public.org_chart_edges 
  ALTER COLUMN entity_id SET NOT NULL;

