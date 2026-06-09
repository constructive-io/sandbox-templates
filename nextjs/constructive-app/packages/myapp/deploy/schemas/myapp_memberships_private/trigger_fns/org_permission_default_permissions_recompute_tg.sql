-- Deploy: schemas/myapp_memberships_private/trigger_fns/org_permission_default_permissions_recompute_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_permissions_public/tables/org_permissions/table
-- requires: schemas/myapp_permissions_public/tables/org_permission_defaults/table
-- requires: schemas/myapp_memberships_public/tables/org_permission_default_permissions/table


CREATE FUNCTION myapp_memberships_private.org_permission_default_permissions_recompute_tg() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  v_entity_id uuid;
  v_permissions bit(64);
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT OLD.entity_id INTO v_entity_id;
  ELSE
    SELECT NEW.entity_id INTO v_entity_id;
  END IF;
  SELECT coalesce(bit_or(p.bitstr), (lpad('', 64, '0'))::bit(64)::bit(64))
  FROM myapp_memberships_public.org_permission_default_permissions AS pp INNER JOIN myapp_permissions_public.org_permissions AS p ON p.id = pp.permission_id
  WHERE
    pp.entity_id = v_entity_id INTO v_permissions;
  UPDATE myapp_permissions_public.org_permission_defaults SET
  permissions = v_permissions
  WHERE
    entity_id = v_entity_id;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

