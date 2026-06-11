-- Deploy: schemas/myapp_memberships_private/trigger_fns/org_org_chart_edge_grants_apply_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema


CREATE FUNCTION myapp_memberships_private.org_org_chart_edge_grants_apply_tg() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  IF NEW.is_grant IS TRUE THEN
    INSERT INTO myapp_memberships_public.org_chart_edges (
      entity_id,
      child_id,
      parent_id,
      position_title,
      position_level,
      created_at,
      updated_at
    )
    VALUES
      (NEW.entity_id, NEW.child_id, NEW.parent_id, NEW.position_title, NEW.position_level, now(), now())
    ON CONFLICT (entity_id, child_id) DO UPDATE SET
    parent_id = EXCLUDED.parent_id, position_title = EXCLUDED.position_title, position_level = EXCLUDED.position_level, updated_at = now();
  ELSE
    DELETE FROM myapp_memberships_public.org_chart_edges
    WHERE
      entity_id = NEW.entity_id AND child_id = NEW.child_id;
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

