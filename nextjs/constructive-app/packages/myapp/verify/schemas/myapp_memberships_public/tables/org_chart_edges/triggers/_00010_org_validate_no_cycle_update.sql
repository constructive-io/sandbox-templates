-- Verify: schemas/myapp_memberships_public/tables/org_chart_edges/triggers/_00010_org_validate_no_cycle_update


SELECT verify_trigger('myapp_memberships_public._00010_org_validate_no_cycle_update');


