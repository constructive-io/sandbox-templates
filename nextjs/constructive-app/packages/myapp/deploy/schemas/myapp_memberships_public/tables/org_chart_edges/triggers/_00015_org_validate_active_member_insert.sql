-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edges/triggers/_00015_org_validate_active_member_insert
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/table
-- requires: schemas/myapp_memberships_private/trigger_fns/org_org_chart_validate_active_member_tg


CREATE TRIGGER _00015_org_validate_active_member_insert
BEFORE INSERT ON myapp_memberships_public.org_chart_edges
FOR EACH ROW
EXECUTE PROCEDURE myapp_memberships_private.org_org_chart_validate_active_member_tg ( );

