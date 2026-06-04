-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edges/triggers/_99990_org_edge_insert_sprt
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/table
-- requires: schemas/myapp_memberships_private/trigger_fns/org_org_chart_edge_insert_tg


CREATE TRIGGER _99990_org_edge_insert_sprt
AFTER INSERT ON myapp_memberships_public.org_chart_edges
REFERENCING NEW TABLE AS new_rows
FOR EACH STATEMENT
EXECUTE PROCEDURE myapp_memberships_private.org_org_chart_edge_insert_tg ( );

