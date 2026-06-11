-- Verify: schemas/myapp_memberships_public/tables/org_chart_edge_grants/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_memberships_public.org_chart_edge_grants', 'select', 'authenticated');


