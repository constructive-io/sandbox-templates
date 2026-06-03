-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edge_grants/alterations/alt0000001012
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edge_grants/table


COMMENT ON TABLE myapp_memberships_public.org_chart_edge_grants IS E'Append-only log of hierarchy edge grants and revocations; triggers apply changes to the edges table';

