-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edges/columns/position_level/alterations/alt0000000999
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/columns/position_level/column


COMMENT ON COLUMN myapp_memberships_public.org_chart_edges.position_level IS E'Numeric seniority level for this position (higher = more senior)';

