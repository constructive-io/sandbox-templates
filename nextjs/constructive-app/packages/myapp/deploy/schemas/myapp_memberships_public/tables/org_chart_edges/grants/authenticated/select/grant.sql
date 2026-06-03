-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edges/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/table


GRANT SELECT ON myapp_memberships_public.org_chart_edges TO authenticated;

