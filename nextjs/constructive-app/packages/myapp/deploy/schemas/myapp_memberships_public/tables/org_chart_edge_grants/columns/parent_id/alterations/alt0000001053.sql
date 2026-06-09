-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/parent_id/alterations/alt0000001053
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/parent_id/column


COMMENT ON COLUMN myapp_memberships_public.org_chart_edge_grants.parent_id IS E'User ID of the manager being assigned; NULL for top-level positions';

