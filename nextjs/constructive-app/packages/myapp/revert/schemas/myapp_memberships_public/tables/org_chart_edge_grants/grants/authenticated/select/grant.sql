-- Revert: schemas/myapp_memberships_public/tables/org_chart_edge_grants/grants/authenticated/select/grant


REVOKE SELECT ON myapp_memberships_public.org_chart_edge_grants FROM authenticated;


