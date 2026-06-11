-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edge_grants/triggers/_00010_org_edge_grants_apply
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edge_grants/table
-- requires: schemas/myapp_memberships_private/trigger_fns/org_org_chart_edge_grants_apply_tg


CREATE TRIGGER _00010_org_edge_grants_apply
AFTER INSERT ON myapp_memberships_public.org_chart_edge_grants
FOR EACH ROW
EXECUTE PROCEDURE myapp_memberships_private.org_org_chart_edge_grants_apply_tg ( );

