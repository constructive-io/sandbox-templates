-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edges/columns/entity_id/alterations/alt0000000994
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/columns/entity_id/column


COMMENT ON COLUMN myapp_memberships_public.org_chart_edges.entity_id IS 'Organization this hierarchy edge belongs to';

