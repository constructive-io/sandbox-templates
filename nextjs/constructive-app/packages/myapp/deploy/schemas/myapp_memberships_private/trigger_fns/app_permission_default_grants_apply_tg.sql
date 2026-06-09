-- Deploy: schemas/myapp_memberships_private/trigger_fns/app_permission_default_grants_apply_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_public/tables/app_permission_default_permissions/table


CREATE FUNCTION myapp_memberships_private.app_permission_default_grants_apply_tg() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  IF NEW.is_grant IS TRUE THEN
    INSERT INTO myapp_memberships_public.app_permission_default_permissions (
      permission_id
    )
    VALUES
      (NEW.permission_id)
    ON CONFLICT (permission_id) DO NOTHING;
  ELSE
    DELETE FROM myapp_memberships_public.app_permission_default_permissions
    WHERE
      permission_id = NEW.permission_id;
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

