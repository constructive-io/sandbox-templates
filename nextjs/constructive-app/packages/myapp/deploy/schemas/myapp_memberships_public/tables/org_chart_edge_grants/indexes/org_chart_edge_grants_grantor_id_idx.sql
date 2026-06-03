-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edge_grants/indexes/org_chart_edge_grants_grantor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edge_grants/table
-- requires: schemas/myapp_memberships_public/tables/org_chart_edge_grants/columns/grantor_id/column


CREATE INDEX org_chart_edge_grants_grantor_id_idx ON myapp_memberships_public.org_chart_edge_grants USING BTREE ( grantor_id );

