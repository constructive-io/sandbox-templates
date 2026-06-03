-- Deploy: schemas/myapp_memberships_private/trigger_fns/org_org_chart_edge_delete_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema


CREATE FUNCTION myapp_memberships_private.org_org_chart_edge_delete_tg() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  PERFORM myapp_memberships_private.org_rebuild_org_hierarchy_sprt(d.entity_id)
  FROM (SELECT DISTINCT entity_id
  FROM old_rows) AS d;
  RETURN NULL;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

