-- Deploy: schemas/myapp_memberships_private/trigger_fns/app_grants_apply_tg
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_public/tables/app_memberships/table


CREATE FUNCTION myapp_memberships_private.app_grants_apply_tg() RETURNS TRIGGER AS $_PGFN_$
BEGIN
  IF NEW.is_grant IS TRUE THEN
    UPDATE myapp_memberships_public.app_memberships SET
    granted = granted | NEW.permissions
    WHERE
      actor_id = NEW.actor_id;
  ELSE
    UPDATE myapp_memberships_public.app_memberships SET
    granted = granted & (~NEW.permissions)
    WHERE
      actor_id = NEW.actor_id;
  END IF;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE;

