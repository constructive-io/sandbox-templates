-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/position_title/alterations/alt0000001024
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/position_title/column


COMMENT ON COLUMN myapp_memberships_public.org_chart_edge_grants.position_title IS 'Job title or role name being assigned in this grant';

