-- Revert: schemas/myapp_memberships_public/tables/org_chart_edges/grants/authenticated/select/grant


REVOKE SELECT ON myapp_memberships_public.org_chart_edges FROM authenticated;


