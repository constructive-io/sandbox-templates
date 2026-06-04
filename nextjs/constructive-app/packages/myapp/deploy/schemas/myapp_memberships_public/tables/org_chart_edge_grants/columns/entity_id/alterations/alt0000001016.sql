-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/entity_id/alterations/alt0000001016
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/entity_id/column


COMMENT ON COLUMN myapp_memberships_public.org_chart_edge_grants.entity_id IS 'Organization this grant applies to';

