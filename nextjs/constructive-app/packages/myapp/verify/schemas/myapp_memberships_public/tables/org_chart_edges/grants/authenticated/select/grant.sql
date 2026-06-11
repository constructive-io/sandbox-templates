-- Verify: schemas/myapp_memberships_public/tables/org_chart_edges/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_memberships_public.org_chart_edges', 'select', 'authenticated');


