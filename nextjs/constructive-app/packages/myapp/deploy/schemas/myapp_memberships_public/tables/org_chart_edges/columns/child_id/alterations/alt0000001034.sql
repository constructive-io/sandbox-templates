-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edges/columns/child_id/alterations/alt0000001034
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/table
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/columns/child_id/column
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/columns/parent_id/column


ALTER TABLE myapp_memberships_public.org_chart_edges 
  ADD CONSTRAINT org_chart_edges_child_id_parent_id_chk 
    CHECK (child_id <> parent_id);

