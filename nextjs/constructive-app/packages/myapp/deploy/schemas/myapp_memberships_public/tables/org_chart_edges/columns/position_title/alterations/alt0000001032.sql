-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edges/columns/position_title/alterations/alt0000001032
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/columns/position_title/column


COMMENT ON COLUMN myapp_memberships_public.org_chart_edges.position_title IS 'Job title or role name for this position in the org chart';

