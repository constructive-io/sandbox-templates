-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/is_grant/alterations/alt0000001023
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/is_grant/column


COMMENT ON COLUMN myapp_memberships_public.org_chart_edge_grants.is_grant IS E'TRUE to add/update the edge, FALSE to remove it';

