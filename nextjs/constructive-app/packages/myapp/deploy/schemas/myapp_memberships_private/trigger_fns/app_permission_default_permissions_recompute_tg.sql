-- Deploy: schemas/myapp_memberships_private/trigger_fns/app_permission_default_permissions_recompute_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_permissions_public/tables/app_permissions/table
-- requires: schemas/myapp_permissions_public/tables/app_permission_defaults/table
-- requires: schemas/myapp_memberships_public/tables/app_permission_default_permissions/table


CREATE FUNCTION myapp_memberships_private.app_permission_default_permissions_recompute_tg() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  v_permissions bit(64);
BEGIN
  SELECT coalesce(bit_or(p.bitstr), (lpad('', 64, '0'))::bit(64)::bit(64))
  FROM myapp_memberships_public.app_permission_default_permissions AS pp INNER JOIN myapp_permissions_public.app_permissions AS p ON p.id = pp.permission_id INTO v_permissions;
  UPDATE myapp_permissions_public.app_permission_defaults SET
  permissions = v_permissions;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

